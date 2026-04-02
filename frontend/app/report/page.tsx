"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  MapPin,
  Locate,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryCard } from "@/components/category-icon";
import { MapPlaceholder } from "@/components/map-placeholder";
import { type ReportCategory, categoryLabels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Категория", description: "Изберете тип проблем" },
  { id: 2, title: "Локация", description: "Маркирайте на картата" },
  { id: 3, title: "Снимка", description: "Прикачете доказателство" },
];

const categories: ReportCategory[] = [
  "illegal_dump",
  "air_pollution",
  "water_pollution",
  "broken_container",
  "noise_pollution",
  "other",
];

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const reverseGeocodeRequestIdRef = useRef(0);

  const [formData, setFormData] = useState({
    category: null as ReportCategory | null,
    title: "",
    description: "",
    location: null as { lat: number; lng: number } | null,
    address: "",
    image: null as File | null,
    imagePreview: null as string | null,
  });

  const resolveAddressFromCoordinates = async (location: {
    lat: number;
    lng: number;
  }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}&accept-language=bg`,
      );

      if (!response.ok) {
        throw new Error("Failed to reverse geocode location");
      }

      const data = await response.json();
      const address = data?.address ?? {};

      const street = [
        address.road || address.pedestrian || address.footway,
        address.house_number,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const neighborhood =
        address.suburb ||
        address.neighbourhood ||
        address.quarter ||
        address.hamlet;

      const district =
        address.city_district || address.district || address.borough;

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county;

      const region = address.state || address.region;
      const postalCode = address.postcode;
      const country = address.country;

      const fullAddressParts = [
        street,
        neighborhood,
        district,
        city,
        region,
        postalCode,
        country,
      ].filter(Boolean);

      const uniqueAddressParts = Array.from(new Set(fullAddressParts));
      const formattedAddress = uniqueAddressParts.join(", ");

      return formattedAddress || data?.display_name || "Адресът не е наличен";
    } catch {
      return `Координати: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
    }
  };

  const handleLocationSelect = async (location: {
    lat: number;
    lng: number;
  }) => {
    const requestId = ++reverseGeocodeRequestIdRef.current;

    setFormData((prev) => ({
      ...prev,
      location,
      address: "Зареждане на адрес...",
    }));

    const resolvedAddress = await resolveAddressFromCoordinates(location);

    if (requestId !== reverseGeocodeRequestIdRef.current) {
      return;
    }

    setFormData((prev) => ({ ...prev, address: resolvedAddress }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null, imagePreview: null }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.title.length >= 5;
      case 2:
        return formData.location !== null;
      case 3:
        return formData.image !== null;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Confetti animation placeholder */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-lime/20 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles size={48} className="text-lime" />
            </div>
            {/* Confetti dots */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-ping"
                style={{
                  backgroundColor: ["#7AE653", "#1A4731", "#F59E0B", "#3B82F6"][
                    i % 4
                  ],
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>

          <h1 className="font-heading text-3xl font-bold text-forest mb-3">
            Сигналът е изпратен!
          </h1>
          <p className="text-muted-foreground mb-6">
            Благодарим ви за активната гражданска позиция. Ще получите известие
            при промяна на статуса.
          </p>

          {/* Points earned */}
          <div className="bg-lime/10 border border-lime/30 rounded-xl p-6 mb-8">
            <p className="text-sm text-forest mb-2">Спечелихте</p>
            <p className="font-heading text-4xl font-bold text-forest">
              +50 точки
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/profile">
              <Button className="w-full bg-forest hover:bg-forest/90">
                Виж моя профил
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Обратно към картата
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Обратно</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Activity size={24} className="text-forest" />
            <span className="font-heading font-bold text-lg text-forest">
              UrbanPulse
            </span>
          </Link>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep > step.id
                        ? "bg-lime text-forest"
                        : currentStep === step.id
                          ? "bg-forest text-white"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? <Check size={20} /> : step.id}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 sm:w-24 lg:w-32 h-1 mx-2 sm:mx-4 rounded-full",
                      currentStep > step.id ? "bg-lime" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          {/* Step 1: Category & Description */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold mb-2">
                Какъв е проблемът?
              </h2>
              <p className="text-muted-foreground mb-8">
                Изберете категория и опишете накратко проблема
              </p>

              {/* Category grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {categories.map((category) => (
                  <CategoryCard
                    key={category}
                    category={category}
                    selected={formData.category === category}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, category }))
                    }
                  />
                ))}
              </div>

              {/* Title */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="title">Заглавие на сигнала</Label>
                <Input
                  id="title"
                  placeholder="Накратко опишете проблема..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value.slice(0, 80),
                    }))
                  }
                  className="h-12"
                  maxLength={80}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/80 символа
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Подробно описание (незадължително)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Дайте повече детайли за проблема..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value.slice(0, 500),
                    }))
                  }
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500 символа
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold mb-2">
                Къде е проблемът?
              </h2>
              <p className="text-muted-foreground mb-6">
                Кликнете на картата, за да маркирате точната локация
              </p>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border mb-6">
                <MapPlaceholder
                  interactive
                  showControls
                  selectedLocation={formData.location}
                  onLocationSelect={handleLocationSelect}
                  className="h-80 sm:h-96"
                />
              </div>

              {/* Use current location button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Simulate getting current location
                  handleLocationSelect({ lat: 42.6977, lng: 23.3219 });
                }}
                className="w-full sm:w-auto mb-6"
              >
                <Locate size={18} className="mr-2" />
                Използвай текущата ми локация
              </Button>

              {/* Selected address */}
              {formData.location && (
                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-forest shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{formData.address}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {formData.location.lat.toFixed(6)},{" "}
                        {formData.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Photo */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold mb-2">
                Добавете снимка
              </h2>
              <p className="text-muted-foreground mb-6">
                Снимката е задължителна и помага за по-бърза обработка на
                сигнала
              </p>

              {/* Upload area */}
              {!formData.imagePreview ? (
                <label
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-forest/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Upload size={28} className="text-muted-foreground" />
                    </div>
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Кликнете за качване</span>{" "}
                      или плъзнете снимка
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG до 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm font-medium truncate">
                      {formData.image?.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Validation message */}
              {!formData.image && (
                <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Снимката е задължителна за подаване на сигнала
                </p>
              )}
            </div>
          )}

          {/* Footer with navigation */}
          <div className="px-6 sm:px-8 py-5 bg-muted/20 border-t flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
              className="rounded-xl border-border hover:border-forest/30 hover:bg-forest/5 transition-all disabled:opacity-40"
            >
              <ArrowLeft size={16} className="mr-2" />
              Назад
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="bg-forest hover:bg-forest/90 rounded-xl shadow-md shadow-forest/20 hover:shadow-forest/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
              >
                Напред
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-lime text-forest hover:bg-lime/90 font-semibold rounded-xl shadow-md shadow-lime/20 hover:shadow-lime/30 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                    Изпращане...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    Подай сигнал
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

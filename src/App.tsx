import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "./pages/HomePage";
import VideoDownloaderPage from "./pages/VideoDownloaderPage";

import AudioConverterPage from "./pages/AudioConverterPage";
import ImageToolsPage from "./pages/ImageToolsPage";
import UpscalerPage from "./pages/UpscalerPage";
import CompressorPage from "./pages/CompressorPage";
import ThumbnailGeneratorPage from "./pages/ThumbnailGeneratorPage";
import TagExtractorPage from "./pages/TagExtractorPage";
import MonetizationCheckerPage from "./pages/MonetizationCheckerPage";
import EarningsCalculatorPage from "./pages/EarningsCalculatorPage";
import BgRemoverPage from "./pages/BgRemoverPage";
import PdfToolPage from "./pages/PdfToolPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import GdprPage from "./pages/GdprPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/video-downloader" element={<VideoDownloaderPage />} />
            
            <Route path="/audio-converter" element={<AudioConverterPage />} />
            <Route path="/image-tools" element={<ImageToolsPage />} />
            <Route path="/upscaler" element={<UpscalerPage />} />
            <Route path="/compressor" element={<CompressorPage />} />
            <Route path="/thumbnail-generator" element={<ThumbnailGeneratorPage />} />
            <Route path="/yt-tag-extractor" element={<TagExtractorPage />} />
            <Route path="/yt-monetization-checker" element={<MonetizationCheckerPage />} />
            <Route path="/yt-earnings-calculator" element={<EarningsCalculatorPage />} />
            <Route path="/bg-remover" element={<BgRemoverPage />} />
            <Route path="/pdf-tool" element={<PdfToolPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/gdpr" element={<GdprPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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
import VideoToolsPage from "./pages/VideoToolsPage";
import BgRemoverPage from "./pages/BgRemoverPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
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
            <Route path="/video-tools" element={<VideoToolsPage />} />
            <Route path="/bg-remover" element={<BgRemoverPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

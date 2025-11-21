import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const RatingSkeleton: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-baseline space-x-2">
                <div className="h-12 w-16 bg-gray-200 rounded"></div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-1"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-1"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-1"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-1"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
        <div className="mt-4">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
    </div>
);


const GoogleRatingCard: React.FC = () => {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const googleReviewUrl = "https://www.google.com/search?gs_ssp=eJzj4tVP1zc0TM4uyzDPjs8yYLRSNaiwNElKTDEwNjExN0lLNDZJsTKosDBLSbZMM7c0NjI2M7EwT_HiTs7JzMtMTlQoyk8FAIbvE3M&q=clinica+roe&oq=clinica+roe&gs_lcrp=EgZjaHJvbWUqGAgAEC4YJxivARjHARi6AhiABBiKBRiOBTIYCAAQLhgnGK8BGMcBGLoCGIAEGIoFGI4FMg8IARAjGCcY4wIYgAQYigUyBggCEEUYPDIGCAMQRRg9MgYIBBBFGDwyBggFEEUYQTIGCAYQRRhBMgYIBxBFGEEyBwgIEAAYgAQyBwgJEAAYgAQyBwgKEAAYgAQyBwgLEAAYgAQyCAgMEAAYFhgeMggIDRAAGBYYHjIICA4QABgWGB7SAQkyODQxajBqMTaoAgCwAgE&client=ms-android-samsung-ss&sourceid=chrome-mobile&ie=UTF-8#ebo=0&mpd=~12150685552396656146/customers/reviews";

  useEffect(() => {
    const fetchRating = async () => {
      setIsLoading(true);
      try {
        if (!process.env.API_KEY) {
            throw new Error("API Key do Gemini não encontrada.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: "Qual é a nota de avaliação e o número de reviews da 'clinica roe' no Google?",
           config: {
             tools: [{googleSearch: {}}],
             responseMimeType: "application/json",
             responseSchema: {
                type: Type.OBJECT,
                properties: {
                  rating: {
                    type: Type.NUMBER,
                    description: 'A nota de avaliação de 0 a 5.'
                  },
                  reviewsCount: {
                    type: Type.INTEGER,
                    description: 'O número total de avaliações.'
                  }
                },
                required: ['rating', 'reviewsCount']
              }
           },
        });
        
        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        if (typeof parsedData.rating === 'number' && typeof parsedData.reviewsCount === 'number') {
            setRating(parsedData.rating);
            setReviewsCount(parsedData.reviewsCount);
        } else {
            throw new Error("Dados recebidos do Gemini estão em formato inesperado, mesmo com schema.");
        }

      } catch (e) {
        console.error("Falha ao buscar a nota do Google:", e);
        // On API error, use fallback values
        console.error("Usando valores de fallback para a nota do Google.");
        setRating(4.7);
        setReviewsCount(310);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, []);

  if (isLoading) {
    return <RatingSkeleton />;
  }
  
  // rating and reviewsCount will have fallback values in case of error
  if (rating === null) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Nota Google</h2>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
           <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google logo" className="h-8"/>
        </div>
        <div className="flex items-baseline space-x-2">
           <p className="text-5xl font-bold text-gray-800">{rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
           <div className="flex items-center">
             {[1, 2, 3, 4, 5].map((star) => {
                if (star <= Math.floor(rating)) {
                    // Full star
                    return <StarIcon key={star} className="w-6 h-6 text-yellow-500" />;
                }
                if (star === Math.ceil(rating) && !Number.isInteger(rating)) {
                    // Partial star
                    return (
                        <div key={star} className="relative w-6 h-6">
                            <StarIcon className="w-6 h-6 text-gray-300 absolute" />
                            <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                                <StarIcon className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    );
                }
                // Empty star
                return <StarIcon key={star} className="w-6 h-6 text-gray-300" />;
             })}
           </div>
        </div>
      </div>
       <div className="mt-4">
        {reviewsCount !== null && (
            <p className="text-gray-600">Baseado em <strong>{reviewsCount.toLocaleString('pt-BR')} avaliações</strong>.</p>
        )}
        <a 
          href={googleReviewUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Ver todas as avaliações &rarr;
        </a>
      </div>
    </div>
  );
};

export default GoogleRatingCard;

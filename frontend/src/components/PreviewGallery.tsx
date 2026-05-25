import { getOutputUrl } from '../api/client';
import { AspectRatioKey, ProductOutput } from '../types';

interface PreviewGalleryProps {
  products: ProductOutput[];
  selectedRatio: AspectRatioKey;
}

export default function PreviewGallery({ products, selectedRatio }: PreviewGalleryProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">
          Generated creatives will appear here after running the pipeline
        </p>
      </div>
    );
  }

  const grouped = products.reduce<Record<string, ProductOutput[]>>((acc, product) => {
    if (!acc[product.productName]) acc[product.productName] = [];
    acc[product.productName].push(product);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([productName, variants]) => (
        <div key={productName}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{productName}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                variants[0].assetSource === 'reused'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {variants[0].assetSource === 'reused' ? 'Asset Reused' : 'AI Generated'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => {
              const outputPath = variant.outputs[selectedRatio];
              if (!outputPath) return null;

              return (
                <div
                  key={`${variant.productSlug}-${variant.region}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getOutputUrl(outputPath)}
                      alt={`${productName} ${selectedRatio} ${variant.region}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="border-t border-gray-100 px-3 py-2">
                    <p className="text-xs font-medium text-gray-700">
                      {variant.region.toUpperCase()} — {selectedRatio}
                    </p>
                    <p className="truncate text-xs text-gray-500">{variant.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

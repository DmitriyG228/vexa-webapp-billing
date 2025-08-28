import BlogCoverImage from '@/components/blog-cover-image';

export default function TestCoverPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Blog Cover Image Preview</h1>
        <div className="mx-auto shadow-2xl">
          <BlogCoverImage />
        </div>
      </div>
    </div>
  );
}

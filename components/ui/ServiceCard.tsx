"use client";
export interface selectCardProps {
  icon: React.ReactNode;
  title: string;
  content?: string;
}

export const ServiceCard: React.FC<selectCardProps> = ({ icon, title, content }) => {
  return (
    <div className="bg-white border-[1px] border-primary rounded-2xl py-12 px-8 hover:shadow-2xl transition duration-300 text-center">
      <div className="flex justify-center mb-4 text-primary text-4xl p-4 bg-secondary-color rounded-full">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      {content && <p className="text-gray-300 text-lg font-light">{content}</p>}
    </div>
  );
};

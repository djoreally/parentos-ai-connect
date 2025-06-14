
interface TestimonialCardProps {
  image?: string;
  name: string;
  role: string;
  quote: string;
}

const TestimonialCard = ({ image, name, role, quote }: TestimonialCardProps) => {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-[16rem] flex-shrink-0">
      {image && <img src={image} alt={name} className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg" />}
      <div>
        <p className="text-base font-medium leading-normal text-foreground">"{quote}"</p>
        <p className="text-sm font-normal leading-normal text-muted-foreground">{name}, {role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;

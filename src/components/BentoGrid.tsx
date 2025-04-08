import { ApiDataFetcher } from '@/utils/APIGallery';
import { BentoCardLg, BentoCard } from './BentoCards';

export default function BentoGrid() {
  const data = ApiDataFetcher({ url: 'http://localhost:8010/proxy' });

  const getGridClass = ({ photos }: { photos: [] }) => {
    const count = ~~(photos.length / 4);
    return `lg:grid-rows-${count}`;
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="z-10 flex w-full justify-center">
        <div className="bg-gradient-to-b from-white/0 to-white rounded-2xl lg:h-[3rem]">
          <p className="mx-auto max-w-fit text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">
            Cada foto cuenta una historia, cada instante guarda una emoción.
          </p>
        </div>
      </div>

      <div className=" mx-auto px-6 lg:max-w-8xl lg:px-8">
        <div className={`mt-10 grid sm:grid-cols-1 sm:grid-rows-1 gap-1 sm:mt-16 lg:grid-cols-4 ${getGridClass}`}>
          {data && data.map(({ id, title, img, horientation }, key) => (horientation === 'horizontal' ? <BentoCard key={key} id={id} title={title} img={img} horientation={horientation} /> : <BentoCardLg key={key} id={id} title={title} img={img} horientation={horientation} />))}
        </div>
      </div>
    </div>
  )
}
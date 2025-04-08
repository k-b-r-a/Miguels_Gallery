import LinkButton from '@/utils/LinkButton';
import InstagramIcon from '@mui/icons-material/Instagram';

export function SocialCard({
  id,
  username,
  socialpage,
  img,
  src,
}: {
  id: number;
  username: string;
  socialpage: string;
  img: string;
  src: string;
}) {
  return (
    <div className="flex flex-col gap-y-16">
      <article className="flex flex-col space-x-0 space-y-8 group md:flex-row md:space-x-8 md:space-y-0 items-center">
        <div className="my-5 mx-30 justify-center">
          <div className="relative flex flex-col items-center col-span-6 row-span-5 gap-8">
            <img
              alt="Name"
              className="object-cover object-top size-40 h-full"
              loading="lazy"
              src={img}
            />
          </div>
          <div className="flex flex-wrap mt-2">
            <LinkButton href={src}>
              <InstagramIcon color="primary"></InstagramIcon>
              <span>{username}</span>
            </LinkButton>
          </div>
        </div>

        <div className="my-5  mr-20 justify-center">
          <div className="relative flex flex-col items-center col-span-6 row-span-5 gap-8 transition duration-300 ease-in-out transform shadow-xl overflow-clip rounded-xl sm:rounded-xl md:group-hover:-translate-y-1 md:group-hover:shadow-2xl lg:border lg:border-gray-800 lg:hover:border-gray-700 lg:hover:bg-gray-800/50">
            <img
              alt="xsd"
              className="object-cover object-top w-[30rem] h-[15rem] transition duration-500  md:scale-110 md:group-hover:scale-105 "
              loading="lazy"
              src={socialpage}
            />
          </div>
        </div>
      </article>
    </div>
  );
}

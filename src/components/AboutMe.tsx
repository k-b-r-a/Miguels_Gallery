export default function AboutMe() {
  return (
    <div className="relative">
      <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
        <div className="transition duration-300 ease-in-out transform shadow-xl overflow-clip rounded-xl sm:rounded-xl md:group-hover:-translate-y-1 md:group-hover:shadow-2xl lg:border lg:hover:lg:hover:border-black lg:hover:bg-gray-100/50 "></div>
      </div>
    </div>
  );
}

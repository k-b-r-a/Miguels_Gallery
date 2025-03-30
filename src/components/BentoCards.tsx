export function BentoCard({ id, title, img, horientation }: { id: number; title: string; img: string; horientation: string }) {

  return (
    <div className="relative max-lg:row-auto">
      <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
        <div className="transition duration-300 ease-in-out transform shadow-xl overflow-clip rounded-xl sm:rounded-xl md:group-hover:-translate-y-1 md:group-hover:shadow-2xl lg:border lg:hover:lg:hover:border-black lg:hover:bg-gray-100/50 ">
          <img
            className="w-full size-full rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] transition duration-300 lg:scale-100 lg:hover:scale-105"
            src={img}
            alt={title}
          />
        </div>
      </div>
    </div >
  )
}

export function BentoCardLg({ id, title, img, horientation }: { id: number; title: string; img: string; horientation: string }) {

  return (
    <div className="relative lg:row-span-3 ">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
        <div className="@container relative min-h-[30rem] w-full grow max-lg:mx-auto max-lg:max-w-sm p-0.1 transition duration-500 ease-in-out transform shadow-xl overflow-clip rounded-xl sm:rounded-xl md:group-hover:-translate-y-1 md:group-hover:shadow-2xl lg:border lg:hover:border-black lg:hover:bg-gray-100/50">
          <img
            className="rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] size-full object-cover object-top transition duration-300 lg:scale-100 lg:hover:scale-105"
            src={img}
            loading="lazy"
            alt={title}
          />
        </div>
      </div>

    </div >
  )
}




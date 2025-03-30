import { BentoCardLg, BentoCard } from "./BentoCards";

export default function BentoGrids() {



  const photos = [
    {
      id: 1,
      title: 'Test',
      horientation: 'vertical',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/484802336_17852745441409507_901970774296308316_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4MTM1MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QHUBbPrCYA_7Bg2rjGD1yuIyzCzFI-sRNs9lBDb1tvSR9qxXK27B7rjCQZuanX_jHo&_nc_ohc=GRbv_huBzJEQ7kNvgEzGnm4&_nc_gid=eKmQW7RW5fkEYMKrOHIVNw&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU4OTIwNDAwNDQ2ODMwMDA0Nw%3D%3D.3-ccb7-5&oh=00_AYEcKoKhtyf8vQrLvZfpUZQtiWbSP7ykqtUfIcgtJduilg&oe=67EE14E1&_nc_sid=10d13b',
    },
    {
      id: 2,
      title: 'Test2',
      horientation: 'horizontal',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/487064679_17854110750409507_5095563201542129482_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4NzIwLnNkci5mNzU3NjEuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGurQ0EO6RQdzC_XUrBBFEaMPz1gKq3Brsd2euEcPDG_Rku_FZu7lJQ-zaYBKz76wM&_nc_ohc=pzpUBIY6PNoQ7kNvgHD5o7R&_nc_gid=NQbGD6XqTa_REKb7BD8qxw&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzU5NjUzODExMjkyNzgyMjU3Mg%3D%3D.3-ccb7-5&oh=00_AYGX0NN8qyvTi-PAyysSB1AumMsxR9pCNDGx3soCqR3mKw&oe=67EE0845&_nc_sid=7a9f4b',
    },
    {
      id: 3,
      title: 'Test3',
      horientation: 'horizontal',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/486652113_17854110759409507_4421218896364049901_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4NzIwLnNkci5mNzU3NjEuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGurQ0EO6RQdzC_XUrBBFEaMPz1gKq3Brsd2euEcPDG_Rku_FZu7lJQ-zaYBKz76wM&_nc_ohc=LAGp5izQmZwQ7kNvgG0vF6t&_nc_gid=NQbGD6XqTa_REKb7BD8qxw&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzU5NjUzODExMjk2MTM0NDIyNg%3D%3D.3-ccb7-5&oh=00_AYEJ9dnmXpUKe5l27wObQUxqkokjA9iBTrY2YyJTZU1ymQ&oe=67EE1BDD&_nc_sid=7a9f4b',
    },
    {
      id: 4,
      title: 'Test',
      horientation: 'vertical',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/484802336_17852745441409507_901970774296308316_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4MTM1MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QHUBbPrCYA_7Bg2rjGD1yuIyzCzFI-sRNs9lBDb1tvSR9qxXK27B7rjCQZuanX_jHo&_nc_ohc=GRbv_huBzJEQ7kNvgEzGnm4&_nc_gid=eKmQW7RW5fkEYMKrOHIVNw&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU4OTIwNDAwNDQ2ODMwMDA0Nw%3D%3D.3-ccb7-5&oh=00_AYEcKoKhtyf8vQrLvZfpUZQtiWbSP7ykqtUfIcgtJduilg&oe=67EE14E1&_nc_sid=10d13b',
    },
    {
      id: 5,
      title: 'Test2',
      horientation: 'horizontal',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/487064679_17854110750409507_5095563201542129482_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4NzIwLnNkci5mNzU3NjEuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGurQ0EO6RQdzC_XUrBBFEaMPz1gKq3Brsd2euEcPDG_Rku_FZu7lJQ-zaYBKz76wM&_nc_ohc=pzpUBIY6PNoQ7kNvgHD5o7R&_nc_gid=NQbGD6XqTa_REKb7BD8qxw&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzU5NjUzODExMjkyNzgyMjU3Mg%3D%3D.3-ccb7-5&oh=00_AYGX0NN8qyvTi-PAyysSB1AumMsxR9pCNDGx3soCqR3mKw&oe=67EE0845&_nc_sid=7a9f4b',
    },
    {
      id: 6,
      title: 'Test3',
      horientation: 'horizontal',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/486652113_17854110759409507_4421218896364049901_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4NzIwLnNkci5mNzU3NjEuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGurQ0EO6RQdzC_XUrBBFEaMPz1gKq3Brsd2euEcPDG_Rku_FZu7lJQ-zaYBKz76wM&_nc_ohc=LAGp5izQmZwQ7kNvgG0vF6t&_nc_gid=NQbGD6XqTa_REKb7BD8qxw&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzU5NjUzODExMjk2MTM0NDIyNg%3D%3D.3-ccb7-5&oh=00_AYEJ9dnmXpUKe5l27wObQUxqkokjA9iBTrY2YyJTZU1ymQ&oe=67EE1BDD&_nc_sid=7a9f4b',
    },
    {
      id: 7,
      title: 'Test',
      horientation: 'vertical',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/484802336_17852745441409507_901970774296308316_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4MTM1MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QHUBbPrCYA_7Bg2rjGD1yuIyzCzFI-sRNs9lBDb1tvSR9qxXK27B7rjCQZuanX_jHo&_nc_ohc=GRbv_huBzJEQ7kNvgEzGnm4&_nc_gid=eKmQW7RW5fkEYMKrOHIVNw&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzU4OTIwNDAwNDQ2ODMwMDA0Nw%3D%3D.3-ccb7-5&oh=00_AYEcKoKhtyf8vQrLvZfpUZQtiWbSP7ykqtUfIcgtJduilg&oe=67EE14E1&_nc_sid=10d13b',
    },
    {
      id: 8,
      title: 'Test2',
      horientation: 'horizontal',
      img: 'https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-15/487064679_17854110750409507_5095563201542129482_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4NzIwLnNkci5mNzU3NjEuZGVmYXVsdF9pbWFnZSJ9&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGurQ0EO6RQdzC_XUrBBFEaMPz1gKq3Brsd2euEcPDG_Rku_FZu7lJQ-zaYBKz76wM&_nc_ohc=pzpUBIY6PNoQ7kNvgHD5o7R&_nc_gid=NQbGD6XqTa_REKb7BD8qxw&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzU5NjUzODExMjkyNzgyMjU3Mg%3D%3D.3-ccb7-5&oh=00_AYGX0NN8qyvTi-PAyysSB1AumMsxR9pCNDGx3soCqR3mKw&oe=67EE0845&_nc_sid=7a9f4b',
    },
  ]

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
          {photos.map(({ id, title, img, horientation }) => (horientation === "horizontal" ? <BentoCard key={id} id={id} title={title} img={img} horientation={horientation} /> : <BentoCardLg key={id} id={id} title={title} img={img} horientation={horientation} />))}
        </div>
      </div>

    </div>
  )
}

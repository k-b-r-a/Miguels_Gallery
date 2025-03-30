import { SocialCard } from "./Socialcard"

export default function SocialNetworks() {

    const socialNetworks = [{ id: 1, username: "@mykegallery", socialpage: "https://i.ibb.co/9HyCMQmG/420shots-so.webp", img: "https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-19/481477659_3361032210694095_5541570755248468663_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QFTcFP1kgHm7T3UnGtNZPaQB3nJpDh0yibSE_cPVA2ldlF93Gd64nglTzoeUh9QhjE&_nc_ohc=eloBKei7mEsQ7kNvgGOvmLq&_nc_gid=dGUH2Amp6Db4wecd2EI_uA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AYElAQI8yxXPWTiDqBt5eO0TeQeWNtgLWS_KEJYG938kpQ&oe=67EE6753&_nc_sid=7a9f4b", src: "https://www.instagram.com/mykegallery/" }, { id: 1, username: "@mykegallery", socialpage: "Instagram", img: "https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-19/481477659_3361032210694095_5541570755248468663_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QFTcFP1kgHm7T3UnGtNZPaQB3nJpDh0yibSE_cPVA2ldlF93Gd64nglTzoeUh9QhjE&_nc_ohc=eloBKei7mEsQ7kNvgGOvmLq&_nc_gid=dGUH2Amp6Db4wecd2EI_uA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AYElAQI8yxXPWTiDqBt5eO0TeQeWNtgLWS_KEJYG938kpQ&oe=67EE6753&_nc_sid=7a9f4b", src: "https://www.instagram.com/mykegallery/" }, { id: 1, username: "@mykegallery", socialpage: "Instagram", img: "https://instagram.faep29-2.fna.fbcdn.net/v/t51.2885-19/481477659_3361032210694095_5541570755248468663_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.faep29-2.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QFTcFP1kgHm7T3UnGtNZPaQB3nJpDh0yibSE_cPVA2ldlF93Gd64nglTzoeUh9QhjE&_nc_ohc=eloBKei7mEsQ7kNvgGOvmLq&_nc_gid=dGUH2Amp6Db4wecd2EI_uA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AYElAQI8yxXPWTiDqBt5eO0TeQeWNtgLWS_KEJYG938kpQ&oe=67EE6753&_nc_sid=7a9f4b", src: "https://www.instagram.com/mykegallery/" }]

    return (
        <div className="absolute top-20 left-8 mx-auto overflow-hidden rounded-xl bg-white/99 w-[55rem] border-1 lg:border-black">
            {socialNetworks.map(({ id, username, socialpage, img, src }) => (<SocialCard key={id} id={id} username={username} socialpage={socialpage} src={src} img={img} />))}
            <div className=""></div>
            <div className="">
            </div >
        </div >
    )
}





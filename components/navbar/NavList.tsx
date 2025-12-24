"use client";


interface NavListProps {
    link: string;
    label: string;
}

const NavListData: NavListProps[] = [
  {
    link: "/browse-listing",
    label: "Properties"
  },
  {
    link: "/rentals",
    label: "Rentals"
  },
  {
    link: "/shortlets",
    label: "Shortlets"
  },
  {
    link: "/hotels",
    label: "Hotels"
  },
  {
    link: "/about",
    label: "About"
  },
]


const NavList = () => {
    return(
    <div className="hidden lg:flex flex-row items-center gap-6 font-medium text-sm">
        {NavListData.map((data, index) => (
            <a className="cursor-pointer text-slate-700 hover:text-primary transition-colors duration-200" key={index} href={data.link}>{data.label}</a>
        ))}
    </div>
    )
}
export default NavList;

"use client";


interface NavListProps {
    link: string;
    label: string;
}

const NavListData: NavListProps[] = [
  {
    link: "",
    label: "Home"
  },
  {
    link: "",
    label: "Rentals"
  },
  {
    link: "",
    label: "Sales"
  },
  {
    link: "",
    label: "Shortlets & Hotels"
  },{
    link: "",
    label: "About"
  },
  {
    link: "",
    label: "Contact"
  },
  {
    link: "",
    label: "FAQ"
  },
]


const NavList = () => {
    return(
    <div className="hidden lg:flex flex-row items-center gap-6 font-semibold text-lg">
        {NavListData.map((data, index) => (
            <a className="cursor-pointer" key={index} href={data.link}>{data.label}</a>
        ))}
    </div>
    )
}
export default NavList;

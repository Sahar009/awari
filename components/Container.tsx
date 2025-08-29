"use client"

interface ContainerProps {
    children: React.ReactNode;
}

 const Container: React.FC<ContainerProps> = ({children}) => {
  return (
    <div className="
    h-full
    max-w-[1450px]
    mx-auto
    lg:px-20
    md:px-10
    sm:px-5
    px-4
    ">
      {children}
    </div>
  )
}


export default Container
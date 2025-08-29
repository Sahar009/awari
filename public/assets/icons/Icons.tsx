interface IconPropType {
    width: string;
    height: string;
    color: string;
    type: string;
}

type IconProps = Omit<IconPropType, "type">



const Icons = ({width, height, color, type}: IconPropType) => {
    switch (type) {
        case "icon":
            

    }
}
import { Image } from "react-native";
import { pmButtons } from "../styles";

const PmButton = ({ buttonType }: { buttonType: string }) => {

    if (buttonType == 'minus') {
        return (
            <Image
                source={require('../assets/minus.png')}
                style={pmButtons.button}
            />
        );
    }

    if (buttonType == 'plus') {
        return (
            <Image
                source={require('../assets/plus.png')}
                style={pmButtons.button}
            />
        );
    }

}

export default PmButton;
import { Image } from "react-native";
import { dieImages } from "../styles";

const Die = ({ asset }: { asset: string }) => {
    if (asset == '4') {
        return (
            <Image
                source={require('../assets/4.png')}
                style={dieImages.die}
            />
        );
    }

    if (asset == '6') {
        return (
            <Image
                source={require('../assets/6.png')}
                style={dieImages.die}
            />
        );
    }

    if (asset == '8') {
        return (
            <Image
                source={require('../assets/8.png')}
                style={dieImages.die}
            />
        );
    }

    if (asset == '10') {
        return (
            <Image
                source={require('../assets/10.png')}
                style={dieImages.die}
            />
        );
    }

    if (asset == '12') {
        return (
            <Image
                source={require('../assets/12.png')}
                style={dieImages.die}
            />
        );
    }

    if (asset == '20') {
        return (
            <Image
                source={require('../assets/20.png')}
                style={dieImages.die}
            />
        );
    }

    if (asset == '100') {
        return (
            <Image
                source={require('../assets/100.png')}
                style={dieImages.die}
            />
        );
    }
};

export default Die;
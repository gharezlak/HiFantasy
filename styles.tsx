import { StyleSheet } from 'react-native';
const COLORS = {
    BLACK: 'black',
    WHITE: 'white',
};

import { Colors } from 'react-native/Libraries/NewAppScreen';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        marginLeft: 22,
        marginRight: 36,
        marginTop: 96,
        marginBottom: 8,
        paddingBottom: 32,
    },
    sliderContainer: {
        paddingVertical: 0,
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    vertical: {

    }
});

export const boxShadow = {
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
};

export const bleStyles = StyleSheet.create({
    engine: {
        position: 'absolute',
        right: 10,
        bottom: 0,
        color: Colors.black,
    },
    scanButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#0a398a',
        marginTop: 24,
        marginLeft: "30%",
        borderRadius: 12,
        width: "40%",
        ...boxShadow,
    },
    scanButtonText: {
        fontSize: 20,
        letterSpacing: 0.25,
        color: Colors.white,
    },
    body: {
        backgroundColor: '#0082FC',
        flex: 1,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
    peripheralName: {
        fontSize: 16,
        textAlign: 'center',
        padding: 10,
    },
    rssi: {
        fontSize: 12,
        textAlign: 'center',
        padding: 2,
    },
    peripheralId: {
        fontSize: 12,
        textAlign: 'center',
        padding: 2,
        paddingBottom: 20,
    },
    row: {
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 20,
        ...boxShadow,
    },
    noPeripherals: {
        margin: 10,
        textAlign: 'center',
        color: Colors.black,
    },
});
export const iosStyles = StyleSheet.create({
    thumb: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 30 / 2,
        height: 30,
        shadowColor: COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.35,
        shadowRadius: 2,
        width: 30,
    },
    track: {
        borderRadius: 1,
        height: 2,
    },
});
export const componentThumbStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'red',
        height: 50,
        justifyContent: 'center',
        width: 100,
    },
});
export const customStyles = StyleSheet.create({
    track: {
        borderRadius: 2,
        height: 40,
    },
});
export const customStyles2 = StyleSheet.create({
    thumb: {
        backgroundColor: COLORS.WHITE,
        borderColor: '#30a935',
        borderRadius: 30 / 2,
        borderWidth: 2,
        height: 30,
        width: 30,
    },
    track: {
        borderRadius: 2,
        height: 4,
    },
});
export const customStyles3 = StyleSheet.create({
    thumb: {
        backgroundColor: '#eb6e1b',
        borderRadius: 5,
        height: 30,
        width: 10,
    },
    track: {
        backgroundColor: '#d0d0d0',
        borderRadius: 5,
        height: 10,
    },
});
export const customStyles4 = StyleSheet.create({
    thumb: {
        backgroundColor: '#f8a1d6',
        borderColor: '#a4126e',
        borderRadius: 10,
        borderWidth: 5,
        height: 20,
        shadowColor: COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.35,
        shadowRadius: 2,
        width: 20,
    },
    track: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 4,
        height: 10,
        shadowColor: COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1,
    },
});
export const customStyles5 = StyleSheet.create({
    thumb: {
        backgroundColor: '#838486',
        borderRadius: 1,
        height: 30,
        width: 20,
    },
    track: {
        backgroundColor: '#d5d8e8',
        borderRadius: 1,
        height: 18,
    },
});
export const customStyles6 = StyleSheet.create({
    thumb: {
        backgroundColor: '#eaeaea',
        borderColor: '#9a9a9a',
        borderRadius: 2,
        borderWidth: 1,
        height: 20,
        width: 20,
    },
    track: {
        backgroundColor: COLORS.WHITE,
        borderColor: '#9a9a9a',
        borderRadius: 2,
        borderWidth: 1,
        height: 14,
    },
});
export const customStyles7 = StyleSheet.create({
    thumb: {
        backgroundColor: 'rgba(150, 150, 150, 0.3)',
        borderColor: 'rgba(150, 150, 150, 0.6)',
        borderRadius: 15,
        borderWidth: 14,
        height: 30,
        width: 30,
    },
    track: {
        backgroundColor: '#303030',
        height: 1,
    },
});
export const customStyles8 = StyleSheet.create({
    container: {
        height: 30,
    },
    thumb: {
        backgroundColor: '#31a4db',
        borderRadius: 10 / 2,
        height: 10,
        shadowColor: '#31a4db',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 2,
        width: 10,
    },
    track: {
        backgroundColor: '#303030',
        height: 2,
    },
});
export const customStyles9 = StyleSheet.create({
    thumb: {
        height: 30,
        shadowColor: COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        width: 30,
    },
});
const thumbnailWidth = 84;
export const aboveThumbStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'grey',
        borderColor: 'purple',
        borderWidth: 1,
        height: 50,
        justifyContent: 'center',
        left: -thumbnailWidth / 2,
        width: thumbnailWidth,
    },
});
const borderWidth = 4;

export const buttonStyles = StyleSheet.create({
    button: {
        backgroundColor: 'blue',
        borderRadius: 10,
        padding: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export const textFont = StyleSheet.create({
    font: {
        fontFamily: 'Roboto-LightItalic',
        fontSize: 36,
        //marginLeft: 15,
        paddingTop: 12,
        flex: 1,
        maxWidth: '30%',
        textAlign: 'center',
    }
});

export const pmButtons = StyleSheet.create({
    button: {
        width: 50,
        height: 50,
        opacity: .8,
        marginTop: 8,
        //marginLeft: 10,
    }
})

export const rollButtons = StyleSheet.create({
    button: {
        backgroundColor: '#039be6',
        borderRadius: 10,
        padding: 10,
        marginTop: 30,
        height: 45,
        marginRight: 16
    },
    text: {
        fontSize: 18,
        color: 'white',
        verticalAlign: 'middle',
        fontFamily: 'Roboto-BoldItalic',
    }
})

export const dieImages = StyleSheet.create({
    die: {
        width: 75,
        height: 75,
        marginRight: 60,
    }
})
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

const QRScanner = () => {

    // const devices = useCameraDevices();
    // const device = devices.back;
    // const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    //     checkInverted: true,
    // });
    // useEffect(() => {
    //     console.log(barcodes);
    // }, [barcodes]);

    // if (device == null) return <View><Text>Loading...</Text></View>;
    // return (
    //     <View style={{ flex: 1 }}>
    //         <Camera
    //             style={{ flex: 1 }}
    //             device={device}
    //             isActive={true}
    //             frameProcessor={frameProcessor}
    //             frameProcessorFps={5}
    //         />
    //     </View>
    // );
};

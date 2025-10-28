import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function QRScanner() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#fff' }}>QR Scanner Screen</Text>
    </View>
  );
}
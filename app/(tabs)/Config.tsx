import { StatusBar, StyleSheet, Text, View } from "react-native";


export default function Config(){


    return (
        <View style={styles.container}>
          <StatusBar 
                  barStyle={"light-content"}
                  translucent={true} 
                  backgroundColor="transparent"/>
          <Text style={styles.text}>Config Component is currently disabled.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: StatusBar.currentHeight! + 5,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
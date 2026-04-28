import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

const SwitchPrueba = ({ texto, value, onValueChange }: any) => {
    return (
        <View style={styles.container}>
            <Text style={{ color: '#000', marginBottom: 5, textAlign: 'center' }}>{texto}: {value ? "Si" : "No"}</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#cc23b5"
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10
    },
});

export default SwitchPrueba;

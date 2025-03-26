import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";

const App = () => {
    const [ultimoNumeroGenerado, setUltimoNumeroGenerado] = useState(null);
    const [yaGuardado, setYaGuardado] = useState(false);
    const [historial, setHistorial] = useState([]);

    const estaEnPeriodoDeSorteo = () => {
        const ahora = new Date();
        const dia = ahora.getUTCDay();
        const hora = ahora.getUTCHours();
        
        if (dia === 4 || dia === 5 || (dia === 6 && hora < 12)) return "SORTEO1";
        if (dia === 0 || dia === 1 || dia === 2 || (dia === 3 && hora < 12)) return "SORTEO2";
        return null;
    };

    const verificarGuardado = async () => {
        const sorteoActual = estaEnPeriodoDeSorteo();
        if (!sorteoActual) return;
        
        const q = query(collection(db, "baloto"), where("sorteo", "==", sorteoActual));
        const snapshot = await getDocs(q);
        setYaGuardado(!snapshot.empty);
    };

    const generarNumeros = () => {
        const numeros = Array.from({ length: 5 }, () => Math.floor(Math.random() * 43) + 1);
        const superBalota = Math.floor(Math.random() * 16) + 1;
        setUltimoNumeroGenerado({ numeros, superBalota });
    };

    const guardarNumeros = async () => {
        if (yaGuardado || !ultimoNumeroGenerado) return;
        
        const sorteoActual = estaEnPeriodoDeSorteo();
        if (!sorteoActual) {
            Alert.alert("Error", "No es tiempo de guardar números.");
            return;
        }

        await addDoc(collection(db, "baloto"), {
            ...ultimoNumeroGenerado,
            timestamp: serverTimestamp(),
            sorteo: sorteoActual
        });
        setYaGuardado(true);
        cargarHistorial();
    };

    const cargarHistorial = async () => {
        const q = query(collection(db, "baloto"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        setHistorial(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    useEffect(() => {
        verificarGuardado();
        cargarHistorial();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Baloto</Text>
            <TouchableOpacity style={styles.button} onPress={generarNumeros}>
                <Text style={styles.buttonText}>Generar Números</Text>
            </TouchableOpacity>
            <View style={styles.numbersContainer}>
                {ultimoNumeroGenerado && (
                    <>
                        {ultimoNumeroGenerado.numeros.map((num, index) => (
                            <Text key={index} style={styles.number}>{num}</Text>
                        ))}
                        <Text style={styles.superNumber}>{ultimoNumeroGenerado.superBalota}</Text>
                    </>
                )}
            </View>
            <TouchableOpacity style={[styles.button, yaGuardado && styles.disabledButton]} onPress={guardarNumeros} disabled={yaGuardado}>
                <Text style={styles.buttonText}>{yaGuardado ? "Ya guardaste en este sorteo" : "Guardar Números"}</Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>Historial</Text>
            <FlatList
                data={historial}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>{new Date(item.timestamp?.toDate()).toLocaleDateString("es-ES")}</Text>
                        <Text>
                            {item.numeros.join(", ")}
                            <Text style={styles.superNumber}>{item.superBalota}</Text>
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#D70654",
        padding: 15,
        borderRadius: 5,
        margin: 10,
        alignItems: "center",
        width: "100%",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
    },
    disabledButton: {
        backgroundColor: "gray",
    },
    numbersContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    number: {
        backgroundColor: "#FFD95F",
        width: 35,
        height: 35,
        textAlign: "center",
        lineHeight: 35,
        borderRadius: 50,
        marginHorizontal: 5,
    },
    superNumber: {
        backgroundColor: "#D70654",
        color: "white",
        width: 35,
        height: 35,
        textAlign: "center",
        lineHeight: 35,
        borderRadius: 50,
        marginHorizontal: 5,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
    },
    listItem: {
        backgroundColor: "#F7F7F7",
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        alignItems: "center",
    },
});

export default App;

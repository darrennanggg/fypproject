import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Switch } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'react-native-paper';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Context } from '../utilities/ContextManager.js'
import { BackgroundCol } from "../utilities/theme.js";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, firebaseDB } from '../firebaseConfig.js';
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";


export function DrawerContent(props) {

    const [deleteMode, setDeleteMode] = useState(false);

    const navigation = useNavigation();

    const userProfile = auth.currentUser;


    // sign out function
    const SignOut = () => {
        signOut(auth)
            .then(() => {
                navigation.replace("Login");
            })
            .catch(error => alert(error.message));
    }


    // toggles the delete mode state
    const toggleDeleteButton = () => {
        setDeleteMode(!deleteMode);
    }


    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <Drawer.Section>
                    <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 15, marginVertical: 10 }}>
                        {/* IMAGE */}
                        <Image source={{ uri: userProfile?.photoURL }} style={[styles.userProfileImg]} />
                        {/* USERNAME */}
                        <Text style={{ fontSize: 20, alignSelf: 'center', marginLeft: "8%" }}>
                            {userProfile?.displayName}
                        </Text>
                    </View>
                </Drawer.Section>

                {/* DRAWER TABS */}
                <Drawer.Section>
                    <DrawerItemList {...props} />
                </Drawer.Section>


            </DrawerContentScrollView>

            {/* SIGN OUT */}
            <Drawer.Section style={{ marginLeft: 10, marginBottom: 10 }}>
                <DrawerItem
                    label="Sign out"
                    icon={({ color, size }) => (
                        <MaterialCommunityIcons name="logout" size={30} color={BackgroundCol()} />
                    )}
                    onPress={SignOut}
                    labelStyle={{
                        fontSize: 16,
                        color: BackgroundCol()
                    }}
                />
            </Drawer.Section>
        </View>
    );
};

const styles = StyleSheet.create({
    sideMenuProfileIcon: {
        resizeMode: 'center',
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
        alignSelf: 'center',
    },
    iconStyle: {
        width: 15,
        height: 15,
        marginHorizontal: 5,
    },
    customItem: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userProfileImg: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderRadius: 40,
        resizeMode: 'cover',
    },
});
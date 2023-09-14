import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/chatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./Miscellaneous/ProfileModal"
import UpdateGroupChatModal from './Miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css'
import ScrollableChat from './ScrollableChat';
import animationData from "../Animations/Typing.json"
import Lottie from 'lottie-react';
import { BASE_URL } from '../config/Url';
import io from 'socket.io-client';
const ENDPOINT = `${BASE_URL}`;
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [online,setOnline] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification, newMessage, setNewMessage } = ChatState();
    const toast = useToast();
    


    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {

            const config = {
                withCredentials: true,
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            setLoading(true);



            const { data } = await axios.get(`${BASE_URL}/api/message/${selectedChat._id}`, config);



            setMessages(data);
            setLoading(false);

            socket.emit('join chat', {chatId:selectedChat._id,isGroupChat:selectedChat.isGroupChat,userId:user._id});
            //If you want to add a feature of showing online whether the user is online or not then do this: socket.on('room connected',()=>{setUserOnline(true)}), so in the backend after join chat connection write the socket.on and also if user left the room you also need to display user offline so when the user disconnected from the room there u also go and write the code
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on('connected', () => { setSocketConnected(true);setOnline(true);console.log('online') });
        // socket.emit('disconnected',()=>{setOnline(false);console.log('offline')});
        if(!socketConnected){
            console.log('offline')
        }
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));
    }, []);

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    // const saveNotifications = async (newMessageReceived) => {
    //     const config = {
    //         withCredentials: true,
    //         credentials: true,

    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${user.token}`
    //         }
    //     }
    //     const { data } = await axios.post(`${BASE_URL}/api/notification`, newMessageReceived, config);
    //     console.log(data);
    // }

    // const deBounce = function (newMessageReceived, d) {

    //     let timer;
    //     return function () {
            
    //         clearTimeout(timer);
    //         console.log('called');
    //         timer = setTimeout(() => {
    //             saveNotifications(newMessageReceived);
    //         }, d);
    //     }

    // }


    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification.includes(newMessageReceived)) {

                    // const debouncedSaveNotifications = deBounce(newMessageReceived, 1000);
                    // debouncedSaveNotifications();   
                                      // saveNotifications(newMessageReceived)
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                    //This is the place where you have to write the api for storing all the notifications in your server api, when you will open any specific chat then also you need an api for removing that message notification from that api
                }

            } else {
                setMessages([...messages, newMessageReceived]);
            }
        });
    })

    const sendMessage = async (event) => {


        if (event.key === "Enter" && newMessage || (event.type === 'click' && newMessage)) {

            socket.emit('stop typing', selectedChat._id);

            try {
                const config = {
                    withCredentials: true,
                    credentials: true,

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }
                setNewMessage("");
                const { data } = await axios.post(`${BASE_URL}/api/message`, {
                    content: newMessage,
                    chatId: selectedChat._id,

                }, config);

                //Check here what is coming from the data

                socket.emit('new message', data);

                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message!",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });
            }

        }

    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
        //Here it is kind of a throttle function, so go, study throttle and compare here
        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            let timeDiff = timeNow - lastTypingTime;

            if (timeDiff >= timerLength && typing) {
                socket.emit('stop typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength);

    }



    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w={'100%'}
                            fontFamily={"Work sans"}
                            display={'flex'}
                            justifyContent={{ base: "space-between" }}
                            alignItems={"center"}
                        >
                            <IconButton
                                display={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setSelectedChat("")}
                            />

                            {
                                !selectedChat.isGroupChat ? (
                                    <>
                                        {getSender(user, selectedChat.users)}
                                         {online ? (<span>Online</span>) : <></>}
                                        <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                    </>
                                ) : (
                                    <>
                                        {selectedChat.chatName.toUpperCase()}
                                        <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                    </>
                                )
                            }
                        </Text>

                        <Box
                            display={'flex'}
                            flexDir={'column'}
                            justifyContent={'flex-end'}
                            p={3}
                            bg={'#e8e8e8'}
                            w={"100%"}
                            h={"100%"}
                            borderRadius={"lg"}
                            overflowY={'hidden'}
                        >
                            {loading ? <Spinner
                                size={'xl'}
                                w={20}
                                h={20}
                                alignSelf={"center"}
                                margin={"auto"}
                            /> : (
                                <div className='messages'>
                                    <ScrollableChat messages={messages} />
                                </div>
                            )}

                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>

                                {isTyping ? <div style={{ width: "60px", height: "50px" }} >


                                    <Lottie
                                        animationData={animationData}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div> : (<></>)}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center", position: 'relative' }}>
                                    <Input variant={'filled'} bg={'#e0e0e0'} placeholder='Enter a message...' onChange={typingHandler} value={newMessage} />
                                    <button onClick={sendMessage}>
                                        <i style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            fontSize: "1.3rem"
                                        }} className="fa-solid fa-paper-plane"
                                        ></i>
                                    </button>

                                </div>





                            </FormControl>
                        </Box>

                    </>


                ) : (
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'} h={'100%'} >
                        <Text fontSize="3xl" pb={3} fontFamily={"Work sans"} >
                            Click on  a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat;

import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react';
import { ChatState } from '../../Context/chatProvider';
import axios from 'axios';
import UserListItem from "../UserAvatar/UserListItem"
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import { BASE_URL } from '../../config/Url';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast = useToast();

    const { user, chats, setChats } = ChatState();


    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }
        try {
            setLoading(true);

            const config = {
                withCredentials: true,
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(`${BASE_URL}/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);

        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })

        }
    }
    const handleSubmit = async () => {

        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            });
            return;
        }

        try {
            const config = {
                withCredentials: true,
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.post(`${BASE_URL}/api/chat/group`, {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id))
            },
                config);

            setChats([data, ...chats])

            onClose();
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        } catch (error) {
            toast({
                title: "Failed to create the group chat!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        }


    }
    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id != delUser._id))

    }

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            return
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
     
        setSearchResult([]);
        setSearch("");


    }



    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={'35px'}
                        fontFamily={'Work sans'}
                        display={'flex'}
                        justifyContent={'center'}
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display={'flex'} flexDir={'column'} alignItems={'center'}>
                        <FormControl>
                            <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add Users: eg. Sachin, Rohit...' mb={3} value={search} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>

                        <Box w={'100%'} display={'flex'} justifyContent={'flex-start'} flexWrap={'wrap'}>

                            {selectedUsers.map(u => (
                                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                            ))}
                        </Box>


                        {loading ? <div>Loading</div> : (

                            searchResult?.slice(0, 4).map((singleUser) => {
                                

                                
                               return <UserListItem key={singleUser._id} user={singleUser} handleFunction={() => handleGroup(singleUser)} />
                        })

                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default GroupChatModal

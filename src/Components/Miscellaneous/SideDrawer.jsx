import { Box, Tooltip, Button, Text, Menu, MenuList, MenuButton, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from 'react';
import { ChatState } from '../../Context/chatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import ChatLoading from '../chatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import { BASE_URL } from '../../config/Url';


const SideDrawer = () => {

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast()

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();

  const logoutHandler = () => {

    localStorage.removeItem("userInfo");
    navigate("/");

  }

  const handleSearch = async () => {
    if (!search) {

      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      })

    }

    try {
      setLoading(true);

      const config = {
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(`${BASE_URL}/api/user?search=${search}`, config); //questionMark shows that i am sending the query



      setLoading(false);
      setSearchResult(data);

    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
      // setLoading(false);
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        withCredentials: true,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.post(`${BASE_URL}/api/chat`, { userId }, config);


      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);  //From here i am setting the setSelectedChat in the chatState
      setSearch("")
      setLoadingChat(false);
      onClose();

    } catch (error) {

      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      })
    }
  }



  return (
    <>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={"center"} bg={"white"} w={"100%"} p={"5px 10px 5px 10px"} borderWidth={"5px"} >
        <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'>
          <Button variant={'ghost'} onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px={"4"}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize={"2xl"} fontFamily={"Work sans"} fontWeight={"extrabold"} >
          Say Hii!
        </Text>
        <div>
          <Menu>
            <MenuButton p={"1"}>
              {/* -----------------------------------------Notification badge Here------------------------------------------- */}
              <div className="badge">
                <BellIcon fontSize={"2xl"} m={1} />
                {notification.length > 0 ? <span className="badge-count">{notification.length}</span> : <></>}

              </div>

            </MenuButton>
            <MenuList pl={2} >
              {!notification.length && "No New Messages"}  {/*In this condition when first condition is true then second condition will be returned*/}
              {notification.map(notif => {

                return <MenuItem key={notif._id} onClick={() => {
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));

                }} >
                  {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              })}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size={'sm'} cursor={'pointer'} name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <Box display={'flex'}  >

                <ProfileModal user={user}  >
                  Your Profile
                </ProfileModal>

              </Box>


              <MenuDivider />
              <MenuItem onClick={() => { logoutHandler() }}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display={'flex'} pb={2}>
              <Input placeholder='Search by name or email' mr={2} value={search} onChange={(e) => { setSearch(e.target.value) }} />
              <Button
                onClick={() => handleSearch()}>
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map(u => (
                <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
              ))

            )}

            {loadingChat && <Spinner ml={"auto"} display={"flex"} />}
          </DrawerBody>
        </DrawerContent>

      </Drawer>
    </>
  )
}

export default SideDrawer

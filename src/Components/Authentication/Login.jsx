import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config/Url';

const Login = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);


  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const toast = useToast();
  const navigate = useNavigate()

  const handleClick = () => {
    setShow(!show);
  }

  const submitHandler =async (form) => {
    setLoading(true);

    if(!form.email || !form.password){
      toast({
        title:"Please fill all the fields!",
        status:"warning",
        duration: 5000,
        isClosable:true,
        position:"bottom"
      });
      setLoading(false);
    }

    try {
      const config = {
        withCredentials: true,
        credentials: 'include',
        headers:{
          "Content-Type":"application/json",

        }
      };
      const {data} = await axios.post(`${BASE_URL}/api/user/login`, form,config);

      toast({
        title:"Login Successful",
        status:"success",
        duration:5000,
        isClosable:true,
        position:"bottom"
      });
       
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate('/chats');
      
    } catch (error) {
      console.log(error);
      toast({
        title:"Error Occured",
        description: error.response.data.message,
        status:"error",
        duration:5000,
        isClosable:true,
        position:'bottom'
      });
      setLoading(false);
    }
  }


  return (
    <VStack spacing={'5px'} color={'black'}>

      <FormControl className='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          name='email'
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder='Enter Your Email'

        />
      </FormControl>

      <FormControl className='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            name='password'
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder='Enter Your Password'

          />
          <InputRightElement width={'4.5rem'}>
            <Button h='1.75rem' size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>

      </FormControl>


      <Button
        colorScheme='blue'
        width={'100%'}
        style={{ marginTop: 15 }}
        onClick={()=>{submitHandler(form)}}
        isLoading = {loading}
      >
        Log In
      </Button>
      <Button
        variant={'solid'}
        colorScheme='red'
        width={'100%'}
        onClick={(e) => {
          e.preventDefault(); setForm({ ...form, email: "guest@example.com", password: "123456" })
        }}
      >
        Guest User Credentials
      </Button>
    </VStack>
  )
}

export default Login

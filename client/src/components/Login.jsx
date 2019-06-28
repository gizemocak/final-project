import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import NavBar from './NavBar';
import { useStoreActions, useStoreState } from "easy-peasy";

export default function Login (props) {
  const formData = useStoreState(state => state.formData);
  const fetchFormData = useStoreActions(actions => actions.fetchFormData);
  const updateFormData = useStoreActions(actions => actions.updateFormData);
  

  const [isLoggedIn, setIsloggedIn] = useState({})

  const formSubmit = (e) => {
   e.preventDefault();
   handleLogin()
  }

  const handleLogin = () => {
    fetchFormData().then(res => {
       setIsloggedIn(res)
     })
  }

  const handleChange = (e, propertyName) => {
    const newFormData = { ...formData };
    newFormData[propertyName] = e.target.value;
    updateFormData(newFormData);
  }

  if(isLoggedIn.email){
    props.history.push("/")
  }

    return (
      <>
      <h1>Login</h1>
      <NavBar/>
      <Form onSubmit={formSubmit}>
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control 
        type="email"
        placeholder="Enter email" 
        value={formData.email}
        onChange={e => {
          handleChange(e, 'email')
        }}
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>
    
      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control 
        type="password" 
        placeholder="Password" 
        value={formData.password}
        onChange={e => {
          handleChange(e, 'password')
        }}
        />
      </Form.Group>
      
      <Button variant="primary" type="submit" >
        Submit
      </Button>
    </Form>
    </>
    );
}
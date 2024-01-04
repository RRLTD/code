import React from 'react';
import { useNavigate } from "react-router-dom";

import Sheet from '@mui/joy/Sheet';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

export default function LoginPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const navigate = useNavigate();

    const login = (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setEmailError('')
        setPasswordError('')
        if (!email) {
            setEmailError('You must input an email')
            return setIsLoading(false)
        }
        if (!password) {
            setPasswordError('You must input a password')
            return setIsLoading(false)
        }
        fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    setError(json.error);
                    setIsLoading(false);
                } else {
                    if (json.success) {
                        if (json.token) {
                            localStorage.setItem('token', json.token);
                            navigate("/dashboard");
                        } else {
                            setError("Backend return success but no token, please contact a website administrator");
                            setIsLoading(false);
                        }
                    } else {
                        setError("The backend did not return an error or success, please contact a website administrator");
                        setIsLoading(false);
                    }
                }
            }).catch(e => {
                setError("There was an error contacting the backend, please contact a website administrator");
                setIsLoading(false);
            })
    }

    const updateEmail = (e) => {
        setEmailError('');
        setEmail(e.target.value);
    }

    const updatePassword = (e) => {
        setPasswordError('');
        setPassword(e.target.value);
    }

    return (
        <Sheet sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Card variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center', gap: 2, width: 400 }} component="form" onSubmit={login}>
                    <Button variant="plain" sx={{ display: "flex", alignItems: "center", gap: 1, textAlign: "left", width: "fit-content" }} onClick={() => navigate('/')}><ArrowBackIcon />Go back</Button>
                    {error &&
                        <Alert color="danger" variant="soft" sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                            {error}
                        </Alert>
                    }
                    <Typography level="h2">
                        Login to your account
                    </Typography>
                    <FormControl error={emailError}>
                        <Input
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={updateEmail}
                            error={!!emailError}
                            InputProps={{
                                readOnly: isLoading,
                            }}
                        />
                        {emailError &&
                            <FormHelperText>
                                <InfoOutlined />
                                {emailError}
                            </FormHelperText>
                        }
                    </FormControl>
                    <FormControl error={passwordError}>
                        <Input
                            placeholder="Password"
                            type="password"
                            autoComplete="password"
                            value={password}
                            onChange={updatePassword}
                            error={!!passwordError}
                            InputProps={{
                                readOnly: isLoading,
                            }}
                        />
                        {passwordError &&
                            <FormHelperText>
                                <InfoOutlined />
                                {passwordError}
                            </FormHelperText>
                        }
                    </FormControl>
                    <Button type="submit" loading={isLoading}>
                        Login
                    </Button>
                </CardContent>
            </Card>
        </Sheet>
    )
}

import React from 'react';
import { useNavigate } from "react-router-dom";
import md5 from 'md5';

import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import Card from '@mui/joy/Card';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import AspectRatio from '@mui/joy/AspectRatio';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Select from '@mui/joy/Select';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';


export default function DashboardPage() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [user, setUser] = React.useState();
    const [songs, setSongs] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/auth/login');
        fetch('http://172.20.10.3:3000/auth/me', {
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    navigate('/auth/login')
                } else {
                    if (json.user) {
                        setUser(json.user);
                        setIsLoading(false);
                    } else {
                        setError('The backend did not return a user, please contact a website administrator.');
                        setIsLoading(false);
                    }
                }
            })
            .catch(e => {
                setError("There was an error contacting the backend, please contact a website administrator");
                setIsLoading(false);
            })
    }, [])

    return (
        isLoading
            ?
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%", height: "100%" }}>
                <CircularProgress />
            </Box>
            :
            error
                ?
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%", height: "100%" }}>
                    <Alert color="danger" variant="soft" sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                        {error}
                    </Alert>
                </Box>
                :
                <Box sx={{ height: "100%" }}>
                    <Box sx={{ p: 4 }}>
                        <Breadcrumbs aria-label="breadcrumbs">
                            <Box style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }} onClick={() => navigate('/dashboard')}>
                                <DashboardRoundedIcon />
                                <Typography>Dashboard</Typography>
                            </Box>
                            <Typography color="neutral">Settings</Typography>
                        </Breadcrumbs>
                        <Typography level="h2">
                            Settings
                        </Typography>
                    </Box>
                    <Tabs
                        defaultValue={0}
                        sx={{
                            bgcolor: 'transparent',
                        }}
                    >
                        <TabList
                            tabFlex={1}
                            size="sm"
                            sx={{
                                pl: {
                                    xs: 0,
                                    md: 4,
                                },
                                justifyContent: 'left',
                                [`&& .${tabClasses.root}`]: {
                                    flex: 'initial',
                                    bgcolor: 'transparent',
                                    [`&.${tabClasses.selected}`]: {
                                        fontWeight: '600',
                                        '&::after': {
                                            height: '2px',
                                            bgcolor: 'primary.500',
                                        },
                                    },
                                },
                            }}
                        >
                            <Tab sx={{ borderRadius: '6px 6px 0 0' }} indicatorInset value={0}>
                                Settings
                            </Tab>
                            <Tab sx={{ borderRadius: '6px 6px 0 0' }} indicatorInset value={1}>
                                Billing
                            </Tab>
                        </TabList>
                    </Tabs>
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <Card sx={{ display: "flex", flexDirection: "row", width: "fit-content" }}>
                            <Stack
                                direction="row"
                                spacing={3}
                                sx={{ display: { xs: 'none', md: 'flex' }, my: 1 }}
                            >
                                <AspectRatio
                                    ratio="1"
                                    maxHeight={200}
                                    sx={{ flex: 1, minWidth: 120, borderRadius: '100%' }}
                                >
                                    <img
                                        src={`https://www.gravatar.com/avatar/${md5(user.email)}?s=150&d=404`}
                                        loading="lazy"
                                        alt=""
                                    />
                                </AspectRatio>
                                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                    <Stack spacing={1}>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl
                                            sx={{
                                                display: {
                                                    sm: 'flex-column',
                                                    md: 'flex-row',
                                                },
                                                gap: 2,
                                            }}
                                        >
                                            <Input size="sm" placeholder="First name" />
                                            <Input size="sm" placeholder="Last name" sx={{ flexGrow: 1 }} />
                                        </FormControl>
                                    </Stack>
                                    <Stack direction="row" spacing={2}>
                                        <FormControl>
                                            <FormLabel>Role</FormLabel>
                                            <Input size="sm" defaultValue="UI Developer" />
                                        </FormControl>
                                        <FormControl sx={{ flexGrow: 1 }}>
                                            <FormLabel>Email</FormLabel>
                                            <Input
                                                size="sm"
                                                type="email"
                                                startDecorator={<EmailRoundedIcon />}
                                                placeholder="email"
                                                defaultValue="siriwatk@test.com"
                                                sx={{ flexGrow: 1 }}
                                            />
                                        </FormControl>
                                    </Stack>
                                </Stack>
                            </Stack>
                            <Stack
                                direction="column"
                                spacing={2}
                                sx={{ display: { xs: 'flex', md: 'none' }, my: 1 }}
                            >
                                <Stack direction="row" spacing={2}>
                                    <AspectRatio
                                        ratio="1"
                                        maxHeight={108}
                                        sx={{ flex: 1, minWidth: 108, borderRadius: '100%' }}
                                    >
                                        <img
                                            src={`https://www.gravatar.com/avatar/${md5(user.email)}?s=150&d=404`}
                                            loading="lazy"
                                            alt=""
                                        />
                                    </AspectRatio>
                                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl
                                            sx={{
                                                display: {
                                                    sm: 'flex-column',
                                                    md: 'flex-row',
                                                },
                                                gap: 2,
                                            }}
                                        >
                                            <Input size="sm" placeholder="First name" />
                                            <Input size="sm" placeholder="Last name" />
                                        </FormControl>
                                    </Stack>
                                </Stack>

                                <FormControl>
                                    <FormLabel>Role</FormLabel>
                                    <Input size="sm" defaultValue="UI Developer" />
                                </FormControl>
                                <FormControl sx={{ flexGrow: 1 }}>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        size="sm"
                                        type="email"
                                        startDecorator={<EmailRoundedIcon />}
                                        placeholder="email"
                                        defaultValue="siriwatk@test.com"
                                        sx={{ flexGrow: 1 }}
                                    />
                                </FormControl>
                            </Stack>
                        </Card>
                    </Box>
                </Box>
    )
}
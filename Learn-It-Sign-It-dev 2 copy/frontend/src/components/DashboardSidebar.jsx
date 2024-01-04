import React from 'react';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import md5 from 'md5';

import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Skeleton from '@mui/joy/Skeleton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import CircularProgress from '@mui/joy/CircularProgress';
import Tooltip from '@mui/joy/Tooltip';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupIcon from '@mui/icons-material/Group';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import ColourSchemeToggle from './ColorSchemeToggle';
import { closeSidebar } from '../utils';

function Toggler({ defaultExpanded = false, renderToggle, children, }) {
    const [open, setOpen] = React.useState(defaultExpanded);
    return (
        <React.Fragment>
            {renderToggle({ open, setOpen })}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateRows: open ? '1fr' : '0fr',
                    transition: '0.2s ease',
                    '& > *': {
                        overflow: 'hidden',
                    },
                }}
            >
                {children}
            </Box>
        </React.Fragment>
    );
}

function Sidebar() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [user, setUser] = React.useState();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false)
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        fetch('http://172.20.10.2:3010/auth/me', {
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(json => {
                if (json.user) {
                    setUser(json.user)
                    setIsLoading(false)
                }
            })
    }, [])

    const logout = () => {
        setIsLoggingOut(true)
        setTimeout(() => {
            localStorage.removeItem("token")
            navigate('/auth/login')
        }, 100)
    }

    return (
        <Sheet
            className="Sidebar"
            sx={{
                position: {
                    xs: 'fixed',
                    md: 'sticky',
                },
                transform: {
                    xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                    md: 'none',
                },
                transition: 'transform 0.4s, width 0.4s',
                zIndex: 10000,
                height: '100dvh',
                width: 'var(--Sidebar-width)',
                top: 0,
                p: 2,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
            }}
        >
            <GlobalStyles
                styles={(theme) => ({
                    ':root': {
                        '--Sidebar-width': '220px',
                        [theme.breakpoints.up('lg')]: {
                            '--Sidebar-width': '240px',
                        },
                    },
                })}
            />
            <Box
                className="Sidebar-overlay"
                sx={{
                    position: 'fixed',
                    zIndex: 9998,
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    opacity: 'var(--SideNavigation-slideIn)',
                    backgroundColor: 'var(--joy-palette-background-backdrop)',
                    transition: 'opacity 0.4s',
                    transform: {
                        xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
                        lg: 'translateX(-100%)',
                    },
                }}
                onClick={() => closeSidebar()}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <img src="/logo.png" height="50" style={{ cursor: "pointer" }} onClick={() => navigate('/dashboard')} />
                <ColourSchemeToggle sx={{ ml: 'auto' }} />
            </Box>
            <Box
                sx={{
                    minHeight: 0,
                    overflow: 'hidden auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    [`& .${listItemButtonClasses.root}`]: {
                        gap: 1.5,
                    },
                }}
                className="no-scrollbar"
            >
                <List
                    size="sm"
                    sx={{
                        gap: 1,
                        '--List-nestedInsetStart': '30px',
                        '--ListItem-radius': (theme) => theme.vars.radius.sm,
                    }}
                >
                    <ListItem>
                        <ListItemButton onClick={() => navigate('/dashboard')} selected={location.pathname === "/dashboard"}>
                            <DashboardRoundedIcon />
                            <ListItemContent>
                                <Typography level="title-sm">Dashboard</Typography>
                            </ListItemContent>
                        </ListItemButton>
                    </ListItem>
                    {user && user.staff &&
                        <ListItem nested>
                            <Toggler
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)}>
                                        <GroupIcon />
                                        <ListItemContent>
                                            <Typography level="title-sm">Staff</Typography>
                                        </ListItemContent>
                                        <KeyboardArrowDownIcon
                                            sx={{ transform: open ? 'rotate(180deg)' : 'none' }}
                                        />
                                    </ListItemButton>
                                )}
                            >
                                <List sx={{ gap: 0.5 }}>
                                    <ListItem sx={{ mt: 0.5 }}>
                                        <ListItemButton>All tasks</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton>Backlog</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton>In progress</ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton>Done</ListItemButton>
                                    </ListItem>
                                </List>
                            </Toggler>
                        </ListItem>
                    }
                </List>

                <List
                    size="sm"
                    sx={{
                        mt: 'auto',
                        flexGrow: 0,
                        '--ListItem-radius': (theme) => theme.vars.radius.sm,
                        '--List-gap': '8px',
                    }}
                >
                    <ListItem>
                        <ListItemButton>
                            <SupportRoundedIcon />
                            Support
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton onClick={() => navigate('/dashboard/settings')} selected={location.pathname === "/dashboard/settings"}>
                            <GroupIcon />
                            Settings
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {isLoading
                    ?
                    <Skeleton animation="wave" variant="circular" width={30} height={30} />
                    :
                    <Avatar
                        variant="outlined"
                        size="sm"
                        src={`https://www.gravatar.com/avatar/${md5(user.email)}?d=404`}
                    />
                }
                {isLoading
                    ?
                    <Skeleton animation="wave" variant="rectangular" width={129} height={38} />
                    :
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography level="title-sm">{(user.firstName + ' ' + user.lastName).length > 17 ? `${(user.firstName + ' ' + user.lastName).slice(0, 17 - 3)}...` : (user.firstName + ' ' + user.lastName)}</Typography>
                        <Typography level="body-xs">{user.email.length > 18 ? `${user.email.slice(0, 18 - 3)}...` : user.email}</Typography>
                    </Box>
                }
                <Tooltip title="Log out" style={{ zIndex: 10000 }}>
                    <IconButton size="sm" variant="plain" color="neutral" onClick={() => logout()}>
                        {isLoggingOut
                            ?
                            <CircularProgress />
                            :
                            <LogoutRoundedIcon />
                        }
                    </IconButton>
                </Tooltip>
            </Box>
        </Sheet>
    )
}

export default function DashboardSidebar() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
            <Sidebar />
            <Box
                component="main"
                className="MainContent"
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    height: '100dvh',
                    gap: 1,
                    overflow: 'auto',
                    pt: "calc(var(--Header-height));"
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}
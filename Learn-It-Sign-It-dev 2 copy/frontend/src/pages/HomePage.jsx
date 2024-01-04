import React from 'react';
import { useNavigate } from "react-router-dom";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ height: 'calc(100vh - 4px)' }}>
            <img src="background.png" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
    )
}
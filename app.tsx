import React from 'react'
import { createRoot } from 'react-dom/client'

import Root from './frontend/root'

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root')
    if (root) createRoot(root).render(<Root/>)
})

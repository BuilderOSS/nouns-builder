import '@testing-library/jest-dom'
import '@vanilla-extract/css/disableRuntimeStyles'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.testing' })

// mock window.scrollTo for framer motion
vi.stubGlobal('scrollTo', vi.fn())

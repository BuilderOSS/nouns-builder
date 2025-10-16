import { style } from '@vanilla-extract/css'

export const connectContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '2rem 0',
  padding: '1rem',
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
})

export const connectLabel = style({
  marginBottom: '0.5rem',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'center',
})

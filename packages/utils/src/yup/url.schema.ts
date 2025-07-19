import * as Yup from 'yup'

const re =
  /^((ftp|http|https):\/\/)(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm

export const urlValidationSchema = Yup.string()
  .transform((value: string) => value.replace(/\/$/, ''))
  .matches(re, 'invalid url')

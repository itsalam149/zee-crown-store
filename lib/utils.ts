import { twMerge } from "tailwind-merge"

type ClassDictionary = { [id: string]: any }
type ClassArray = ClassValue[]
export type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray

function clsx(...inputs: ClassValue[]): string {
    const classes: string[] = []

    const handle = (input: ClassValue) => {
        if (!input) return
        if (typeof input === "string" || typeof input === "number") {
            classes.push(String(input))
            return
        }
        if (Array.isArray(input)) {
            input.forEach(handle)
            return
        }
        if (typeof input === "object") {
            for (const key in input as ClassDictionary) {
                if ((input as ClassDictionary)[key]) classes.push(key)
            }
            return
        }
    }

    inputs.forEach(handle)
    return classes.join(" ")
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs))
}
"use client"

import { Button } from "@/components/ui/button"

export function AuthSocialButtons() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <Button variant="outline" className="h-11" onClick={() => console.log("Google sign in")}>
        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
            fill="#EA4335"
          />
          <path
            d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
            fill="#4285F4"
          />
          <path
            d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
            fill="#FBBC05"
          />
          <path
            d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
            fill="#34A853"
          />
        </svg>
      </Button>
      <Button variant="outline" className="h-11" onClick={() => console.log("Apple sign in")}>
        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.569 12.6254C17.597 15.2438 19.8125 16.3275 19.8415 16.3421C19.8193 16.4026 19.4736 17.5322 18.6222 18.6986C17.8829 19.7229 17.1138 20.7411 15.9524 20.7681C14.8095 20.7942 14.4292 20.0892 13.1193 20.0892C11.8086 20.0892 11.3968 20.7411 10.3271 20.7942C9.20908 20.8473 8.30673 19.6802 7.55542 18.6602C6.02402 16.5851 4.84639 12.8511 6.42228 10.2187C7.20303 8.91158 8.60386 8.10137 10.1126 8.07532C11.2017 8.04927 12.2275 8.83214 12.8967 8.83214C13.5651 8.83214 14.8095 7.90244 16.1286 8.05747C16.7368 8.08352 18.1376 8.31921 19.0693 9.68051C18.9707 9.74092 17.5468 10.5879 17.569 12.6254ZM15.0543 6.05454C15.6832 5.28776 16.1017 4.21343 15.9722 3.13C15.0412 3.17214 13.8889 3.76187 13.2334 4.52865C12.6508 5.20512 12.1389 6.31579 12.2938 7.36943C13.3389 7.44593 14.4253 6.82096 15.0543 6.05454Z" />
        </svg>
      </Button>
      <Button variant="outline" className="h-11" onClick={() => console.log("GitHub sign in")}>
        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C18.2072 22.5807 20.2772 21.0497 21.7437 19.0074C23.2101 16.965 23.9993 14.5143 24 12C24 5.37 18.63 0 12 0Z"
          />
        </svg>
      </Button>
    </div>
  )
}


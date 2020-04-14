import React, { createContext, useState, useEffect } from 'react'
import Client from 'shopify-buy'

const client = Client.buildClient({
    domain: 'level-up-tuts-test-store-cjkadhsfg.myshopify.com',
    storefrontAccessToken: '0600aa0d65be9abf0ec2a1271fafb876'
})

const defaultValues = {
    idCartOpen: false,
    cart: [],
    addproductToCart: () => { },
    client,
    checkout: {
        lineItems: [],
    },
}

export const StoreContext = createContext(defaultValues)

export const StoreProvider = ({ children }) => {
    const [checkout, setCheckout] = useState(defaultValues.checkout)

    useEffect(() => {
        initializeCheckout()
    }, [])

    const initializeCheckout = async () => {
        try {
            //check if it's a browser
            const isBrowser = typeof window !== 'undefined'

            //check if id exists
            const currentCheckoutId = isBrowser
                ? localStorage.getItem('checkout_id')
                : null

            let newCheckout = null

            if (currentCheckoutId) {
                //if id exists, fetch checkout from shopify
                newCheckout = await client.checkout.fetch(currentCheckoutId)
            } else {
                // if id does not, create new checkout
                newCheckout = await client.checkout.create()
                if (isBrowser) {
                    localStorage.setItem('checkout_id', newCheckout.id)
                }
            }

            // set checkout to state
            setCheckout(newCheckout)
        } catch (e) {
            console.error(e)
        }
    }
    const addProductToCart = async variantId => {
        try {
            const lineItems = [
                {
                    variantId,
                    quantity: 1,
                }
            ]
            const newCheckout = await client.checkout.addLineItems(
                checkout.id,
                lineItems,
            )
            setCheckout(newCheckout)
            // console.log(addItems.webUrl)
        } catch (e) {
            console.error(e)
        }
    }
    return (
        <StoreContext.Provider
            value={{
                ...defaultValues,
                checkout,
                addProductToCart,
            }}>
            {children}
        </StoreContext.Provider>
    )
}
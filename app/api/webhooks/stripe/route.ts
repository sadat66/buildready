import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripeService } from '~/lib/services/StripeService'

/**
 * Stripe webhook endpoint
 * This endpoint receives webhook events from Stripe and processes them
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body as text
    const body = await request.text()
    
    // Get the Stripe signature from headers
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify the webhook signature and construct the event
    let event
    try {
      event = stripeService.verifyWebhookSignature(body, signature)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Log the event for debugging
    console.log(`Received Stripe webhook event: ${event.type}`)

    // Handle the event
    try {
      await stripeService.handleWebhookEvent(event)
    } catch (error) {
      console.error('Error handling webhook event:', error)
      return NextResponse.json(
        { error: 'Error processing webhook event' },
        { status: 500 }
      )
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
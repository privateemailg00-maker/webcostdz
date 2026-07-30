# Web Project Planner

WebCostDz – Complete Project Plan for Lovable AI

Project Overview

Build a modern, responsive web application called WebCostDz.

The purpose of WebCostDz is to help customers estimate the cost, duration, and complexity of building a website without contacting a developer.

The website should feel like a modern SaaS product with beautiful animations, a clean UI, and an AI-powered questionnaire.

The target audience is businesses in Algeria, but the application should support English, French, and Arabic in the future.

Tech Stack

Frontend

React (Vite)

Tailwind CSS

React Router

Framer Motion

React Hook Form

Zustand

Lucide Icons

Backend

Node.js

Express.js

Database

Supabase

AI

Google Gemini API

Deployment

Vercel (Frontend)

Render (Backend)

Design Style

Create a premium SaaS UI inspired by:

Stripe

Linear

Vercel

Framer

Requirements:

Rounded cards

Glassmorphism where appropriate

Smooth animations

Responsive design

Modern gradients

Beautiful progress indicator

Light and Dark Mode

Mobile-first

Primary color:

Blue (#2563EB)

Secondary:

Purple (#7C3AED)

Accent:

Emerald (#10B981)

Website Flow

Landing Page

↓

Onboarding

↓

Business Selection

↓

Dynamic AI Questions

↓

Price Calculation

↓

Results

↓

Lead Form

Landing Page

The landing page should include:

Hero Section

Title:

Know the cost of your website in less than 2 minutes.

Subtitle:

Answer a few simple questions and receive an estimated price, timeline, project complexity, and feature breakdown.

Buttons

Start Estimation

Learn More

Sections

Features

Why Choose WebCostDz

How It Works

FAQ

Footer

Onboarding

Like a mobile application.

Three screens.

Screen 1

Welcome

Title

Welcome to WebCostDz

Description

Estimate the price of your future website quickly and easily.

Button

Continue

Screen 2

Title

How it Works

Description

Choose your business type.

Answer a few questions.

Receive an instant estimate.

Button

Continue

Screen 3

Title

Ready?

Description

Let's discover your project.

Button

Start

Step 1

Choose Business Type

Display modern cards with icons.

Business Categories

Restaurant

Coffee Shop

Bakery

Hotel

Travel Agency

Medical Clinic

Dental Clinic

Pharmacy

Gym

School

Training Center

Real Estate

Construction Company

Law Firm

Accounting Office

Corporate Company

Grocery Store

Supermarket

Furniture Store

Clothing Store

Shoe Store

Electronics Store

Phone Shop

Computer Shop

Beauty Salon

Barber Shop

Laundry

Car Repair Garage

Car Rental

Delivery Company

Logistics Company

Pet Shop

Flower Shop

Printing Company

Photography Studio

Event Planner

E-commerce Store

Portfolio Website

Blog

News Website

NGO

Government Organization

Custom Business

Every business should have:

icon

title

short description

Step 2

Generate Questions with Gemini

When the user selects a business category, send the business type to Gemini.

Prompt:

You are an experienced software business analyst.

Generate between 8 and 15 questions that help estimate the complexity of building a website for the selected business.

Requirements:

Return JSON only.

Use multiple-choice questions whenever possible.

Keep questions simple and understandable for non-technical users.

Include only questions that affect pricing.

Each question must contain:

id

question

type

options

weight (1–5)

category

Example format:

[
{
"id":1,
"question":"Do you need online booking?",
"type":"radio",
"options":["Yes","No"],
"weight":4,
"category":"Features"
}
]

Cache generated questions inside Supabase.

If questions already exist for the selected business, load them from the database instead of calling Gemini again.

Step 3

Question Wizard

Display one question at a time.

Show:

Progress Bar

Current Step

Previous Button

Next Button

Animations

Save progress automatically.

Step 4

Price Calculation

Never allow Gemini to decide the final price.

Gemini only identifies the requested features.

The backend calculates the estimate using a pricing engine.

Example pricing:

Landing Page

+$120

Authentication

+$180

Admin Dashboard

+$350

CMS

+$250

Blog

+$120

Booking System

+$280

Reservation Calendar

+$200

Online Payments

+$220

Inventory Management

+$400

POS System

+$500

Order Management

+$220

Notifications

+$100

Analytics Dashboard

+$180

File Upload

+$100

Customer Accounts

+$150

Reviews

+$80

Chat

+$150

Multilingual

+$180

SEO

+$120

Contact Form

+$50

Google Maps

+$50

Multiple Branches

+$300

API Integration

+$250

The backend should sum the selected features and produce:

Minimum Price

Maximum Price

Estimated Duration

Complexity Score

Duration Formula

Small Project

7–14 days

Medium Project

15–30 days

Large Project

30–60 days

Enterprise

60+ days

Step 5

AI Project Analysis

After pricing is calculated, send the selected features to Gemini.

Prompt:

You are a senior software architect.

Analyze the project.

Return JSON only.

Include:

project_summary

recommended_stack

complexity

suggested_features

development_phases

possible_future_features

Do not calculate price.

Results Page

Beautiful animated page.

Display

Estimated Price

Example:

$1,400 – $1,700

Estimated Time

22 Days

Complexity

Medium

Project Summary

Generated by Gemini

Included Features

Displayed as chips/cards.

Development Phases

Timeline

Recommended Tech Stack

Optional Features

Extra Cost

Example:

Mobile App

+$2,000

AI Chatbot

+$500

SMS Notifications

+$250

Lead Form

After results.

Fields

Full Name

Company

Phone

Email

Project Details

Button

Request Exact Quote

Store everything inside Supabase.

Admin Dashboard

Statistics

Total Estimates

Average Price

Most Popular Business

Conversion Rate

Recent Leads

Businesses

Questions Cache

Feature Pricing

Settings

Gemini API Key

Database Tables

businesses

id

name

icon

description

ai_questions

id

business_id

questions_json

created_at

estimates

id

business_type

answers_json

features_json

minimum_price

maximum_price

duration

complexity

summary

email

phone

company

created_at

pricing_rules

id

feature

price

duration

complexity_weight

AI Rules

Gemini is responsible for:

Generating questions.

Understanding user requirements.

Generating summaries.

Suggesting technologies.

Suggesting additional features.

Gemini must NEVER calculate prices.

All prices must come from the backend pricing engine.

Extra Features

Favorites

Recent Estimates

Share Estimate

Download PDF Proposal

Dark Mode

Light Mode

Arabic Support

French Support

English Support

Responsive Design

Smooth Animations

Loading Skeletons

Toast Notifications

Error Handling

Offline Detection

Performance Requirements

Lazy load pages.

Optimize images.

Use React Query or efficient caching where appropriate.

Cache Gemini responses.

Minimize API calls.

Fast page transitions.

Folder Structure

/client
/components
/pages
/layouts
/hooks
/store
/services
/utils
/assets

/server
/routes
/controllers
/services
/middleware
/pricing
/gemini
/database

/shared
/types
/constants

Overall Goal

The application should feel like a premium AI-powered website estimation platform rather than a simple calculator. Every step should guide the customer through a smooth, conversational experience that results in a trustworthy estimate, a clear project scope, and a high-quality lead for future client engagement.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://webcostdz.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2c9e63df-473c-4ea3-8216-e3fe295d3411).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

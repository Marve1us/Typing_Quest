# Typing Quest

A fun, game-based typing application designed for kids aged 11-12 to learn keyboard familiarity, correct hand placement, and measurable speed/accuracy improvement.

## Overview

Typing Quest turns daily typing practice into engaging games with visible progress and rewards. Kids practice 15 minutes/day to achieve 20-30 WPM with 95% accuracy.

## Recent Changes

- **2026-01-25**: Initial MVP implementation with 4 game modes, badge system, and parent dashboard

## Project Architecture

### Frontend (React + TypeScript + Vite)
- **Pages**: Landing, Play (game selection), Badges, Dashboard
- **Games**: Race Sprint, Alien Defense, Home Row Builder, Word Dash
- **Components**: Typing engine, keyboard visual, avatar system, badge display, streak tracking

### Backend (Express + TypeScript)
- **Database**: PostgreSQL with Drizzle ORM
- **API Endpoints**: `/api/profiles`, `/api/sessions`, `/api/badges`
- **Logic**: XP/leveling system, streak tracking, automatic badge awarding

### Database Schema
- `profiles`: Player profiles with nickname, avatar, level, XP, streaks
- `sessions`: Game session results with WPM, accuracy, duration
- `badges`: Earned badges linked to profiles

## Game Modes

1. **Race Sprint**: Type sentences to race your car across the finish line
2. **Alien Defense**: Type letters/words to zap incoming aliens
3. **Home Row Builder**: Guided drills with keyboard visualization for proper finger placement
4. **Word Dash**: Type themed word lists with streak multipliers

## Features

- **Real-time typing engine**: Character-by-character feedback, WPM/accuracy calculation
- **Badge system**: 12 earnable badges for speed, accuracy, streaks, and achievements
- **XP & Leveling**: Earn XP from sessions, level up over time
- **Streak tracking**: Daily practice streaks with visual calendar
- **Parent dashboard**: Weekly metrics, progress charts, goal tracking
- **Guest mode**: Quick play without account creation
- **Dark/light theme**: Toggle between themes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI, Recharts, Wouter
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Build**: Vite

## Running the Project

The application runs with `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

## Database Commands

- `npm run db:push` - Push schema changes to database

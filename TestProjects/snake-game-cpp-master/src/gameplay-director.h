/*
* Ataraxer's Snake
*
* Class: GameplayDirector
* File: gameplay-director.h
*
* GameplayDirector is a pure static class that controles gameplay aspects.
* All GameplayDirector methods and field are prefixed with "gd" for GameplayDirector.
*
* Interface:
*	gdStart() - initializes the game and RenderingDirector.
*	gdProcess() - processes the game on every tick
*	gdKeyPressed() - reacts on keyboard events passed from RenderingDirector
*	gdMoveSnakeFromWall(int&, int&) - moves snake's segment to the opposite wall if it's
*									  coordinate overflows field size
*	gdIsActive() - returns game state (paused or active)
*	gdGetSnake() - provides access to snake
*	gdGetSnack(int) - provides access to snacks
*	gdGetSnakeQuantity() - returns snaks quantity
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version: 1.1.0 Alpha
*/
#ifndef GD_H_
#define GD_H_

#include <vector>
#include <cstdlib>

#include "snake.h"
#include "food.h"

enum key {key_up, key_right, key_down, key_left, key_esc};

class GameplayDirector
{
	public:
		/* Methods */
		static void gdStart(int argc, char ** argv);
		static void gdProcess();
		static void gdKeyPressed(key pressedKey);
		static void gdMoveSnakeThroughWall(int & X, int & Y);

		/* Getters */
		static bool  gdIsActive();
		static Snake gdGetSnake();
		static Food  gdGetSnack(int n);
		static int   gdGetSnacksQuantity();		

	private:
		/* Methods */
		static inline void gdPause();
		static inline void gdTurnSnake(direction newDirection);
		static void gdAddSnack(food_type type = normal);

		/* Fields */
		static Snake Python;
		static vector<Food> gdSnacks;
		static bool isActive; // Game paused if false.

		/* Options */
		static const int SNACKS_LIMIT = 1;
		static const int FIELD_WIDTH = 30;
		static const int FIELD_HEIGHT = 20;
};

#endif

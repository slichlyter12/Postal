/*
* Ataraxer's Snake
*
* Implements: GameplayDirector
* File: gameplay-director.h
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version 1.1.0 Alpha
*/
#include <iostream>

#include "gameplay-director.h"
#include "rendering-director.h"

using std::cout;
using std::endl;

/* Static field initialization */
Snake GameplayDirector::Python;
vector<Food> GameplayDirector::gdSnacks;
bool GameplayDirector::isActive = false;

/* Public methods */
/*
* gdStart(int argc, char* argv)
*
* Starts the game and initializes RenderingDirector.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdStart(int argc, char ** argv) {
	isActive = true;
	RenderingDirector::rdInitialize(argc, argv);
}

/*
* gdProcess()
*
* Processes the game every tick. Tick value is second divided by snake's speed
* (currently tick is 1/12th of second).
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdProcess()
{
	if (isActive) {
		// Prevents snake from speeding up after cathing snack
		bool isHungry = true;
		// Checks if snake has collected the food
		for (int i = 0; i < gdSnacks.size(); i++) {
			int X = gdSnacks[i].X();
			int Y = gdSnacks[i].Y();
			if (Python.HasCaughtSnack(X, Y)) {
				gdSnacks.erase(gdSnacks.begin() + i);
				isHungry = false;
			}
		}
		// Adds food
		if (gdSnacks.size() < SNACKS_LIMIT) {
			gdAddSnack();
		}
		// Moves snake
		if (isHungry) {
			Python.Move();
		}
	}
}


/*
* gdKeyPressed(key keyPressed)
*
* Reacts on keyboard events passed by RenderingDirector.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdKeyPressed(key pressedKey) 
{
	switch(pressedKey)
	{
		case key_up:
			gdTurnSnake(UP);
			break;
		case key_right:
			gdTurnSnake(RIGHT);
			break;
		case key_down:
			gdTurnSnake(DOWN);
			break;
		case key_left: 
			gdTurnSnake(LEFT);
			break;
		case key_esc:
			gdPause();
			break;
	}
}

/*
* gdMoveSnakeThroughWall(int & X, int & Y)
*
* Checks if snake's segment at the given coordinate has crossed wall
* and moves this segment to the opposite site of the field if it has.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdMoveSnakeThroughWall(int & X, int & Y) {
	if (X >= FIELD_WIDTH) X = 0;
	if (Y >= FIELD_HEIGHT) Y = 0;
	if (X < 0) X = FIELD_WIDTH - 1;
	if (Y < 0) Y = FIELD_HEIGHT - 1;
}

/* Getters */
bool GameplayDirector::gdIsActive() {
	return isActive;
}

Snake GameplayDirector::gdGetSnake() {
	return Python;
}

Food GameplayDirector::gdGetSnack(int n) {
	return gdSnacks[n];
}

int GameplayDirector::gdGetSnacksQuantity() {
	return gdSnacks.size();
}

/* Private methods */
/*
* gdPause()
*
* Pauses the game.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdPause() {
	isActive = !isActive;
	if (isActive) cout << "Unpaused" << endl;
			 else cout << "Paused"   << endl;
}

/*
* gdTurnSnake(direction newDirection)()
*
* Turnes snake to the given direction.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdTurnSnake(direction newDirection) {
	// prevents from turning while paused
	if (isActive) {
		Python.Turn(newDirection);
	}
}

/*
* gdTurnSnake(direction newDirection)()
*
* Adds new snack to the field.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void GameplayDirector::gdAddSnack(food_type type) {
	int foodX, foodY;
	// prevents from apperaing inside the snake
	do {
		foodX = rand() % FIELD_WIDTH;
		foodY = rand() % FIELD_HEIGHT;
	} while (Python.IsHere(foodX, foodY));
	gdSnacks.push_back(Food(foodX, foodY, type));
}

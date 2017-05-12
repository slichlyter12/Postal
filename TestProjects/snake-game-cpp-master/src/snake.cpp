/*
* Ataraxer's Snake
*
* Implements: Snake
* File: snake.cpp
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version 1.1.0 Alpha
*/
#include <iostream>

#include "snake.h"
#include "gameplay-director.h"

using std::cout;
using std::endl;

/* Constructors */

/*
* Snake(int size)
*
* Default constructor which takes optional length parameter and creates a new snake
* of that length or default lenght, if no parameter provided, with default direction
* (currently RIGHT) and head at default initial coordinates.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
Snake::Snake(int size) : myDirection(RIGHT) {
	// prevents from snake's dislocation due to the check of moving through wall
	isReady = false;
	indulgence = 0;
	// head needs to be pushed first via standart push_back() fucntion, because
	// AddScale method adds new scale based on the previous one.
	Piece headSegment(dSnakeInitialPositionX, dSnakeInitialPositionY);
	myScales.push_back(headSegment);
	// -1 excludes head
	for (int i = 0; i < size - 1; i++) {
		AddScale();
	}
	isReady = true;
}

/* Public methods */
/*
* Turn(direction newDirection)
* 
* Assignes new direction to the snake.
*
* Returns: boolean value.
*	true - if turn was successful
*	false - if turn was illegal
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
bool Snake::Turn(direction newDirection) {
	// prevents from moving straight backwards
	bool turnsProperlyX = (myDirection >= 2 && newDirection <  2);
	bool turnsProperlyY = (myDirection <  2 && newDirection >= 2); 
	if ( (turnsProperlyX || turnsProperlyY) && canTurn ) {
		myDirection = newDirection;
		// Prevents multiple turns until snake has moved
		canTurn = false;
		return false;
	} else {
		return true;
	}
}


/*
* Move()
* 
* Moves snake for one position in the current direction. Movement is being
* performed by adding new scale to the front of the snake and deleting one
* scale at the end.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void Snake::Move() {
	canTurn = true;
	// checks for crash
	if (HasCrashed()) {
		if (indulgence == 0) {
			indulgence = INDULGENCE_SIZE;
			Punish();
		} else {
			indulgence -= 1;
		}
	} else {
		// if snake has stopped crashing into itself it's indulgence resets
		indulgence = 0;
	}
	// performs movement
	DelScale();
	AddScale();
}


/*
* HasCrashed()
* 
* Checks if snake has crashed into itself.
*
* Returns: boolean value.
*	true - if has crashed
*	false - if hasn't
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
bool Snake::HasCrashed() {
	// determines index of the last scale
	int end = myScales.size() - 1;
	// if at least one scale coordinates are accordingly equal to head coordinates
	// snake considered crashed into itself
	for (int i = 0; i < myScales.size(); i++) {
		bool sameX = myScales[end].X() == myScales[i].X();
		bool sameY = myScales[end].Y() == myScales[i].Y();
		if (sameX && sameY && i != end) {
			return true;
		}
	}
	return false;
}

/*
* HasCaughtSnack(int x, int y)
* 
* Checks if snake has caught food at given coordinate.
*
* Returns: boolean value.
*	true - if has caught
*	false - if hasn't
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
bool Snake::HasCaughtSnack(int x, int y) {
	// determines index of the last scale
	int end = myScales.size() - 1;
	if (x == myScales[end].X() && y == myScales[end].Y()) {
		AddScale();
		PrintSize();
		return true;
	} else {
		return false;
	}
}


/*
* IsHere(int x, int y)
* 
* Checks if given coordinate belongs to any of snake's scales
*
* Returns: boolean value.
*	true - if does
*	false - if doesn't
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
bool Snake::IsHere(int x, int y) {
	for (int i = 0; i < myScales.size(); i++) {
		if (x == myScales[i].X() &&
			y == myScales[i].Y()  ) {
			return true;
		}
	}
	return false;
}

/* Getters */
Piece const Snake::GetScale(int n) {
	return myScales[n];
}

int const Snake::Size() {
	return myScales.size();
}

/* Private methods */
/*
* AddScale()
* 
* Pushes one new scale to the front of the snake.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void Snake::AddScale() 
{
	// determines index of the last scale
	int end = myScales.size() - 1;
	int changeX = 0, changeY = 0;
	switch(myDirection) {
		case UP:
			changeY = 1;
			break;
		case RIGHT:
			changeX = 1;
			break;
		case DOWN:
			changeY = -1;
			break;
		case LEFT:
			changeX = -1;
			break;
	}
	int lastX = myScales[end].X() + changeX;
	int lastY = myScales[end].Y() + changeY;
	// prevents from dislocation at creation
	if (isReady) {
		// moves snake through walls which will make it appear at the opposite wall
		GameplayDirector::gdMoveSnakeThroughWall(lastX, lastY);
	}
	Piece tmpScale(lastX, lastY);
	myScales.push_back(tmpScale);
}

/*
* DelScale()
* 
* Pops one scale from the end of the snake.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void Snake::DelScale() {
	myScales.erase(myScales.begin());
}

/*
* Punish()
* 
* Pops 3 scales from the end of the snake one by one until it's length
* is bigger than minimum snake's size.
*
* Returns: nothing.
*
* Author: Anton Karamanov
* Date: 08/01/2012
* Version: 1.0
*/
void Snake::Punish() {
	for (int j = 0; j < CRASH_PENALTY; j++) {
		if (myScales.size() >= MIN_SIZE + 2) {
				DelScale();
		}
	}
	PrintSize();
}

void Snake::PrintSize() {
	cout << "Snake's length is " << Size() << " now" << endl;
}

/*
* Ataraxer's Snake
*
* Class: Snake
* File: snake.h
*
* Class snake represents the snake, that can be controled by player or AI.
*
* Interface:
*	Turn(direction) - turns snake in given direction
*	Move() - moves snake for one position
*	HasCrashed() - check for colliding into itself
*	HasCaughtFood(int, int) - check for gathering food at given coordinate
*	IsHere(int, int) - check for presence of the snake at given coordinate
*	GetScale(int) - provides access to snake's n-th scale
*	Size() - returns snake's length in scales quantity
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version 1.1.0 Alpha
*/
#ifndef SNAKE_H_
#define SNAKE_H_

#include <vector>
#include "piece.h"

using std::vector;

enum direction {UP, DOWN, RIGHT, LEFT, NONE};

class Snake {
	public:
		/* Constructors */
		Snake(int size = dSnakeSize);

		/* Methods */
		bool Turn(direction newDirection);
		void Move();

		bool HasCrashed();
		bool HasCaughtSnack(int x, int y);
		bool IsHere(int x, int y);

		/* Getters */
		Piece const GetScale(int n);
		int const Size();

	private:
		/* Methods */
		void AddScale();
		void DelScale();
		void Punish();
		void PrintSize();

		/* Fields */
		direction myDirection;
		vector<Piece> myScales;
		bool canTurn;
		bool isReady;
		int indulgence;

		/* Options */
		// d prefix stands for "default"
		static const int dSnakeSize = 4;
		static const int dSnakeInitialPositionX = 0;
		static const int dSnakeInitialPositionY = 9;
		static const int CRASH_PENALTY = 3;
		static const int INDULGENCE_SIZE = 12;
		static const int MIN_SIZE = 3;
};

#endif

/*
* Ataraxer's Snake
*
* Class: Food
* File: food.h
*
* Food class represents food pieces, that can be eaten by snake.
*
* Interface:
*	X() - gets X coordinate of food
*	Y() - gets Y coordinate of food
*	Type() - gets type of food
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version 1.1.0 Alpha
*/
#ifndef FOOD_H_
#define FOOD_H_

#include "piece.h"

enum food_type {normal};

class Food
{
	public:
		/* Constructors */
		Food(int x, int y, food_type inType) : type(inType) {
			coordinate = Piece(x, y);
		}

		Food(Piece inCoordinate, food_type inType) : type(inType) {
			coordinate = inCoordinate;
		}
		/* Methods */
		/* Getters */
		int const X() {return coordinate.X();}
		int const Y() {return coordinate.Y();}
		int const Type() {return type;}

	private:
		food_type type;
		Piece coordinate;
};

#endif

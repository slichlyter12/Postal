/*
* Ataraxer's Snake
*
* Class: Piece
* File: piece.h
*
* Piece class is a single element of a snake, or food piece.
* It's being represented by it's coordinates X and Y (fields
* myX and myY) in in-game coordinate scale. Piece's coordinates
* are being assigned at it's creation and can't be changed after.
*
* Interface:
*	X() - returns value of X coordinate of the segment.
*	Y() - returns value of Y coordinate of the segment.
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 05/01/2012
* Version 1.1.0 Alpha
*/
#ifndef PIECE_H_
#define PIECE_H_

class Piece {
	public:
		/* Constructor */
		Piece() { }
		Piece(int inX, int inY) : myX(inX), myY(inY) { }

		/* Getters */
		int X() const {return myX;}
		int Y() const {return myY;}

		/* Operators */
		/*
		* Equality check, operator ==
		*
		* Piece is considered equal to another one if both of it's
		* coordinates are equal to corresponding coordinates of the 
		* segment which it is being compared to.
		*
		* Version: Final
		*/
		bool operator==(const Piece & s) {
			return (s.myX == myX && s.myY == myY);
		}
		
		/*
		* Value assignment, operator =
		* 
		* Assigns value of one segment to another segment, by assigning
		* each of it's coordinates to value of corresponding coordinate 
		* of that segment.
		*
		* Version: Final
		*/
		Piece & operator=(const Piece & s) {
			myX = s.myX;
			myY = s.myY;
			return *this;
		}

	private:
		int myX, myY;
};

#endif

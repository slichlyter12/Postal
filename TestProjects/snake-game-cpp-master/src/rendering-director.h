/*
* Ataraxer's Snake
*
* Class: RenderingDirector
* File: rendering-director.h
*
* RenderingDirector is a pure static class that performs rendering of the game scene.
* All RenderingDirector methods and field are prefixed with "rd" for RenderingDirector.
*
* Interface:
*	rdInitialize(int argc, char **argv) - initialises rendering
*
* © Karamanov A. A., 2012
* Developers: Anton Karamanov
* Date: 08/01/2012
* Version: 1.1.0 Alpha
*/
#ifndef RD_H_
#define RD_H_

#include "snake.h"

enum color {white, black, red, dark_red, green, dark_green, blue, orange};

class RenderingDirector
{
	public:
		/* Methods */
		static void rdInitialize(int argc, char **argv);

	private:
		/* Methods */
		/* GLUT functions */
		static void rdRender();
		static void rdFrameControl(int arg);
		static void rdWindowResize(int W, int H);
		static void rdKeyPressed(unsigned char pressedKey, int x, int y);
		static void rdSpecialKeyPressed(int pressedKey, int x, int y);

		/* Color managment */
		static void rdSetColor(int red, int green, int blue, float alpha = 0.0f);
		static void rdPickColor(color newColor, float opacity = 0.0f);
		static float rdOpacity(float modifier = 1.0f);

		/* Objects rendering */
		static void rdRenderSnake(Snake inSnake);
		static void rdRenderSnacks();
		static void rdDrawSquare(float x, float y, float size = SQUARE_SIZE);

		/* Fields */
		static int rdFrame;
		static float rdAngle;

		/* Options */
		static const int WIDTH  = 960;
		static const int HEIGHT = 640;
		static const int FRAME_RATE = 60;
		static const int SNAKE_SPEED = 12; // Snake's movement per second
		static const float PI;
		static const char* TITLE;
		static const int SQUARE_SIZE = 32;
};

#endif
